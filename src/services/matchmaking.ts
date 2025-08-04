import { db } from '../firebase/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  doc, 
  updateDoc, 
  getDoc, 
  writeBatch,
  orderBy,
  limit,
  runTransaction
} from 'firebase/firestore';
import { codingProblems } from '../data/codingProblems';
import { Match } from '../types/match';
import { updateMatchResults } from '../firebase/firebase';

// Collections
const COLLECTIONS = {
  MATCH_ROOMS: 'matchRooms',
  MATCHES: 'matches'
} as const;

// Room status
const ROOM_STATUS = {
  WAITING: 'waiting',
  MATCHED: 'matched',
  EXPIRED: 'expired'
} as const;

// Match status
const MATCH_STATUS = {
  MATCHED: 'matched',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const;

// Types
interface MatchRoom {
  id?: string;
  players: string[];
  status: string;
  createdAt: any;
  problemId?: number;
  matchId?: string;
}

// Logging utility
const log = {
  info: (message: string, data?: any) => console.log(`[Matchmaking] ${message}`, data || ''),
  error: (message: string, error?: any) => console.error(`[Matchmaking Error] ${message}`, error || ''),
  warn: (message: string, data?: any) => console.warn(`[Matchmaking Warning] ${message}`, data || '')
};

// Get a random problem for matches
const getRandomProblem = (): number => {
  const randomIndex = Math.floor(Math.random() * codingProblems.length);
  return codingProblems[randomIndex].id;
};

// Clean up expired rooms (older than 10 minutes)
const cleanupExpiredRooms = async (): Promise<void> => {
  try {
    const roomsRef = collection(db, COLLECTIONS.MATCH_ROOMS);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const expiredQuery = query(
      roomsRef,
      where('createdAt', '<', tenMinutesAgo),
      where('status', '==', ROOM_STATUS.WAITING)
    );
    
    const expiredRooms = await getDocs(expiredQuery);
    
    if (!expiredRooms.empty) {
      const batch = writeBatch(db);
      expiredRooms.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      log.info(`Cleaned up ${expiredRooms.size} expired rooms`);
    }
  } catch (error) {
    log.error('Error cleaning up expired rooms', error);
  }
};

// Check if user is already in an active room
const getUserActiveRoom = async (userId: string): Promise<any | null> => {
  try {
    const roomsRef = collection(db, COLLECTIONS.MATCH_ROOMS);
    const userRoomQuery = query(
      roomsRef,
      where('players', 'array-contains', userId),
      where('status', 'in', [ROOM_STATUS.WAITING, ROOM_STATUS.MATCHED])
    );
    
    const userRooms = await getDocs(userRoomQuery);
    return userRooms.empty ? null : userRooms.docs[0];
  } catch (error) {
    log.error('Error checking user active room', error);
    return null;
  }
};

// Check if user has active matches
const getUserActiveMatch = async (userId: string): Promise<Match | null> => {
  try {
    const matchesRef = collection(db, COLLECTIONS.MATCHES);
    
    const queries = [
      query(matchesRef, where('player1', '==', userId), where('status', 'in', [MATCH_STATUS.MATCHED, MATCH_STATUS.IN_PROGRESS])),
      query(matchesRef, where('player2', '==', userId), where('status', 'in', [MATCH_STATUS.MATCHED, MATCH_STATUS.IN_PROGRESS]))
    ];
    
    const [player1Matches, player2Matches] = await Promise.all([
      getDocs(queries[0]),
      getDocs(queries[1])
    ]);
    
    const allMatches = [...player1Matches.docs, ...player2Matches.docs];
    
    if (allMatches.length > 0) {
      const matchDoc = allMatches[0];
      return { id: matchDoc.id, ...matchDoc.data() } as Match;
    }
    
    return null;
  } catch (error) {
    log.error('Error checking active matches', error);
    return null;
  }
};

// Create a new room
const createNewRoom = async (userId: string): Promise<string> => {
  try {
    const roomsRef = collection(db, COLLECTIONS.MATCH_ROOMS);
    const newRoom: MatchRoom = {
      players: [userId],
      status: ROOM_STATUS.WAITING,
      createdAt: serverTimestamp()
    };
    
    const roomDoc = await addDoc(roomsRef, newRoom);
    log.info(`Created new room ${roomDoc.id} for user ${userId}`);
    return roomDoc.id;
  } catch (error) {
    log.error('Error creating new room', error);
    throw error;
  }
};

// Atomic operation to find and join a room or create a new one
const atomicJoinOrCreateRoom = async (userId: string): Promise<{ type: 'joined' | 'created', roomId: string, matchId?: string }> => {
  return await runTransaction(db, async (transaction) => {
    log.info(`Starting atomic operation for user ${userId}`);
    
    // Find available rooms
    const roomsRef = collection(db, COLLECTIONS.MATCH_ROOMS);
    const availableRoomsQuery = query(
      roomsRef,
      where('status', '==', ROOM_STATUS.WAITING),
      orderBy('createdAt', 'asc'),
      limit(10)
    );
    
    const availableRooms = await getDocs(availableRoomsQuery);
    log.info(`Found ${availableRooms.size} rooms to check`);
    
    // Look for a room with exactly 1 player (excluding current user)
    for (const roomDoc of availableRooms.docs) {
      const roomData = roomDoc.data() as MatchRoom;
      
      // Check if room has exactly 1 player and it's not the same user
      if (roomData.players.length === 1 && !roomData.players.includes(userId)) {
        log.info(`Found available room ${roomDoc.id} with player ${roomData.players[0]}`);
        
        const opponentId = roomData.players[0];
        const problemId = getRandomProblem();
        
        // Create match first
        const matchesRef = collection(db, COLLECTIONS.MATCHES);
        const newMatchRef = doc(matchesRef);
        
        const match = {
          player1: opponentId,
          player2: userId,
          problemId,
          startTime: Date.now(),
          status: MATCH_STATUS.MATCHED,
          submissions: {},
          pointsAwarded: false
        };
        
        // Create match and update room in the same transaction
        transaction.set(newMatchRef, match);
        transaction.update(roomDoc.ref, {
          players: [opponentId, userId],
          status: ROOM_STATUS.MATCHED,
          problemId,
          matchId: newMatchRef.id
        });
        
        log.info(`Successfully joined room ${roomDoc.id} and created match ${newMatchRef.id}`);
        return { type: 'joined', roomId: roomDoc.id, matchId: newMatchRef.id };
      }
    }
    
    // No available room found, create a new one
    log.info(`No available rooms found, creating new room for user ${userId}`);
    
    const newRoom: MatchRoom = {
      players: [userId],
      status: ROOM_STATUS.WAITING,
      createdAt: serverTimestamp()
    };
    
    const newRoomRef = doc(roomsRef);
    transaction.set(newRoomRef, newRoom);
    
    log.info(`Created new room ${newRoomRef.id} for user ${userId}`);
    return { type: 'created', roomId: newRoomRef.id };
  });
};

// Delete room associated with a match (immediate cleanup)
const deleteRoomForMatch = async (matchId: string): Promise<void> => {
  try {
    const roomsRef = collection(db, COLLECTIONS.MATCH_ROOMS);
    const roomQuery = query(
      roomsRef,
      where('matchId', '==', matchId)
    );
    
    const roomSnapshot = await getDocs(roomQuery);
    
    if (!roomSnapshot.empty) {
      const batch = writeBatch(db);
      roomSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      log.info(`IMMEDIATE CLEANUP: Deleted ${roomSnapshot.size} room(s) for match ${matchId}`);
    } else {
      log.info(`No rooms found for match ${matchId} during cleanup`);
    }
  } catch (error) {
    log.error('Error deleting room for match', error);
  }
};

// Auto-update winner stats after match completion
const autoUpdateWinnerStats = async (winnerId: string, loserId: string, matchId: string): Promise<void> => {
  try {
    log.info(`Auto-updating stats for winner: ${winnerId}, loser: ${loserId}, match: ${matchId}`);
    
    // Wait 3 seconds before updating stats to ensure match document is fully updated
    setTimeout(async () => {
      try {
        // First check if the match document has pointsAwarded already set to true
        const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
        const matchDoc = await getDoc(matchRef);
        
        if (matchDoc.exists()) {
          const matchData = matchDoc.data();
          
          if (matchData.pointsAwarded === true) {
            log.info(`Match ${matchId} stats already processed, skipping auto-update`);
            return;
          }
          
          // Mark the match as having points awarded FIRST to prevent race conditions
          await updateDoc(matchRef, {
            pointsAwarded: true,
            pointsAwardedTimestamp: serverTimestamp()
          });
          
          log.info(`Marked match ${matchId} as points awarded, now updating user stats`);
          
          // Now update the user stats
          const result = await updateMatchResults(winnerId, loserId, matchId);
          
          if (result.success) {
            log.info(`Successfully auto-updated stats for match ${matchId}`);
          } else {
            log.error(`Failed to auto-update stats for match ${matchId}:`, result.error);
            
            // If stats update failed, revert the pointsAwarded flag
            await updateDoc(matchRef, {
              pointsAwarded: false
            });
          }
        } else {
          log.error(`Match ${matchId} not found when trying to update stats`);
        }
      } catch (error) {
        log.error(`Error in auto-update stats for match ${matchId}:`, error);
      }
    }, 3000); // 3 second delay
  } catch (error) {
    log.error('Error setting up auto-update stats', error);
  }
};

// Main matchmaking function
export const joinMatchmaking = async (userId: string): Promise<string> => {
  try {
    log.info(`User ${userId} joining matchmaking`);
    
    // Clean up expired rooms first
    await cleanupExpiredRooms();
    
    // Check if user already has an active match
    const activeMatch = await getUserActiveMatch(userId);
    if (activeMatch) {
      log.info(`User ${userId} already has active match: ${activeMatch.id}`);
      return activeMatch.id;
    }
    
    // Check if user is already in a room
    const existingRoom = await getUserActiveRoom(userId);
    if (existingRoom) {
      log.warn(`User ${userId} is already in room ${existingRoom.id}`);
      return 'waiting';
    }
    
    // Use atomic operation to join or create room
    const result = await atomicJoinOrCreateRoom(userId);
    
    log.info(`User ${userId} ${result.type} room ${result.roomId}`);
    
    // If a match was immediately created (user joined existing room), return the match ID
    if (result.matchId) {
      return result.matchId;
    }
    
    return 'waiting';
  } catch (error: any) {
    log.error('Error in joinMatchmaking', error);
    throw new Error(`Matchmaking failed: ${error.message}`);
  }
};

// Cancel matchmaking
export const cancelMatchmaking = async (userId: string): Promise<boolean> => {
  try {
    log.info(`Canceling matchmaking for user: ${userId}`);
    
    // Find user's room
    const userRoom = await getUserActiveRoom(userId);
    
    if (userRoom) {
      const roomData = userRoom.data() as MatchRoom;
      
      if (roomData.players.length === 1 && roomData.players[0] === userId) {
        // User is alone in room, delete it
        await deleteDoc(userRoom.ref);
        log.info(`Deleted room ${userRoom.id} for user ${userId}`);
      } else {
        // Remove user from room
        const updatedPlayers = roomData.players.filter(p => p !== userId);
        await updateDoc(userRoom.ref, {
          players: updatedPlayers
        });
        log.info(`Removed user ${userId} from room ${userRoom.id}`);
      }
    }
    
    return true;
  } catch (error: any) {
    log.error('Error canceling matchmaking', error);
    return false;
  }
};

// Enhanced listen for match function with multiple listeners
export const listenForMatch = (
  userId: string,
  onMatchFound: (match: Match) => void,
  onMatchUpdate: (match: Match) => void
): (() => void) => {
  log.info(`Setting up enhanced match listeners for user: ${userId}`);
  
  const unsubscribeFunctions: (() => void)[] = [];
  const processedMatches = new Set<string>();
  
  // 1. Listen for direct match creation (most reliable)
  const matchesRef = collection(db, COLLECTIONS.MATCHES);
  const directMatchQueries = [
    query(matchesRef, where('player1', '==', userId), where('status', '==', MATCH_STATUS.MATCHED)),
    query(matchesRef, where('player2', '==', userId), where('status', '==', MATCH_STATUS.MATCHED))
  ];
  
  directMatchQueries.forEach((matchQuery, index) => {
    const directMatchUnsubscribe = onSnapshot(matchQuery, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const match = { id: change.doc.id, ...change.doc.data() } as Match;
          
          if (!processedMatches.has(match.id)) {
            log.info(`NEW MATCH FOUND via direct listener ${index} for user ${userId}: ${match.id}`);
            processedMatches.add(match.id);
            onMatchFound(match);
          }
        } else if (change.type === 'modified') {
          const match = { id: change.doc.id, ...change.doc.data() } as Match;
          log.info(`Match ${match.id} updated for user ${userId}`);
          onMatchUpdate(match);
        }
      });
    }, error => {
      log.error(`Error in direct match listener ${index}`, error);
    });
    
    unsubscribeFunctions.push(directMatchUnsubscribe);
  });
  
  // 2. Backup: Listen for room updates
  const roomsRef = collection(db, COLLECTIONS.MATCH_ROOMS);
  const userRoomQuery = query(
    roomsRef,
    where('players', 'array-contains', userId)
  );
  
  const roomUnsubscribe = onSnapshot(userRoomQuery, async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      const roomData = change.doc.data() as MatchRoom;
      const roomId = change.doc.id;
      
      log.info(`Room ${roomId} ${change.type} for user ${userId}:`, {
        status: roomData.status,
        players: roomData.players,
        hasMatchId: !!roomData.matchId
      });
      
      // When room becomes matched and has a matchId, load the match as backup
      if (roomData.status === ROOM_STATUS.MATCHED && roomData.matchId) {
        if (!processedMatches.has(roomData.matchId)) {
          log.info(`Loading match ${roomData.matchId} from room ${roomId} for user ${userId}`);
          
          try {
            const matchRef = doc(db, COLLECTIONS.MATCHES, roomData.matchId);
            const matchSnap = await getDoc(matchRef);
            
            if (matchSnap.exists()) {
              const match = { id: matchSnap.id, ...matchSnap.data() } as Match;
              log.info(`BACKUP: Match found via room listener for user ${userId}: ${match.id}`);
              
              processedMatches.add(match.id);
              onMatchFound(match);
              
              // Clean up the room after a short delay (reduced from 5 seconds to 2 seconds)
              setTimeout(async () => {
                try {
                  await deleteDoc(change.doc.ref);
                  log.info(`Cleaned up matched room: ${roomId}`);
                } catch (error) {
                  log.error('Error cleaning up room', error);
                }
              }, 2000);
            } else {
              log.error(`Match ${roomData.matchId} not found in database`);
            }
          } catch (error) {
            log.error('Error loading match from room', error);
          }
        }
      }
    }
  }, error => {
    log.error('Error in room listener', error);
  });
  
  unsubscribeFunctions.push(roomUnsubscribe);
  
  // 3. Listen for match status updates
  const updateMatchQueries = [
    query(matchesRef, where('player1', '==', userId), where('status', 'in', [MATCH_STATUS.IN_PROGRESS, MATCH_STATUS.COMPLETED])),
    query(matchesRef, where('player2', '==', userId), where('status', 'in', [MATCH_STATUS.IN_PROGRESS, MATCH_STATUS.COMPLETED]))
  ];
  
  updateMatchQueries.forEach((updateQuery, index) => {
    const updateUnsubscribe = onSnapshot(updateQuery, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          const match = { id: change.doc.id, ...change.doc.data() } as Match;
          log.info(`Match ${match.id} status updated to ${match.status} for user ${userId}`);
          onMatchUpdate(match);
        }
      });
    }, error => {
      log.error(`Error in update match listener ${index}`, error);
    });
    
    unsubscribeFunctions.push(updateUnsubscribe);
  });
  
  // Return cleanup function
  return () => {
    log.info(`Unsubscribing from all ${unsubscribeFunctions.length} matchmaking listeners for user ${userId}`);
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
  };
};

// Get match by ID
export const getMatch = async (matchId: string): Promise<Match | null> => {
  try {
    const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (matchSnap.exists()) {
      return { id: matchSnap.id, ...matchSnap.data() } as Match;
    }
    
    return null;
  } catch (error) {
    log.error('Error getting match', error);
    return null;
  }
};

// Submit match solution
export const submitMatchSolution = async (
  matchId: string,
  userId: string,
  code: string,
  language: string,
  testCasesPassed: number,
  totalTestCases: number
): Promise<boolean> => {
  try {
    log.info(`Submitting solution for match: ${matchId}, user: ${userId}`);
    
    const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (!matchSnap.exists()) {
      throw new Error('Match not found');
    }

    const matchData = matchSnap.data() as Omit<Match, 'id'>;
    
    if (matchData.player1 !== userId && matchData.player2 !== userId) {
      throw new Error('User is not part of this match');
    }
    
    const submission = {
      code,
      language,
      submissionTime: Date.now(),
      testCasesPassed,
      totalTestCases
    };

    const newSubmissions = {
      ...matchData.submissions,
      [userId]: submission
    };

    const bothSubmitted = newSubmissions[matchData.player1] && newSubmissions[matchData.player2];
    
    let updateData: any = {
      submissions: newSubmissions,
      status: bothSubmitted ? MATCH_STATUS.COMPLETED : MATCH_STATUS.IN_PROGRESS,
      pointsAwarded: matchData.pointsAwarded || false
    };

    if (bothSubmitted) {
      // Determine winner
      const p1Sub = newSubmissions[matchData.player1];
      const p2Sub = newSubmissions[matchData.player2];
      
      let winnerId: string;
      let loserId: string;
      
      if (p1Sub.testCasesPassed > p2Sub.testCasesPassed) {
        winnerId = matchData.player1;
        loserId = matchData.player2;
      } else if (p2Sub.testCasesPassed > p1Sub.testCasesPassed) {
        winnerId = matchData.player2;
        loserId = matchData.player1;
      } else {
        // Tie on test cases, check submission time
        if (p1Sub.submissionTime < p2Sub.submissionTime) {
          winnerId = matchData.player1;
          loserId = matchData.player2;
        } else {
          winnerId = matchData.player2;
          loserId = matchData.player1;
        }
      }
      
      updateData.winner = winnerId;
      
      log.info(`Match ${matchId} completed, winner: ${winnerId}`);
      
      // CRITICAL: Delete the associated room immediately when match is completed
      log.info(`Match ${matchId} is being marked as completed, deleting associated room immediately`);
      
      // Delete room immediately - don't wait for listeners
      setTimeout(async () => {
        await deleteRoomForMatch(matchId);
      }, 100); // Very short delay to ensure the update goes through first
      
      // Update the match document first
      await updateDoc(matchRef, updateData);
      
      // AUTO-UPDATE WINNER STATS: Update winner's match wins after 3 seconds
      autoUpdateWinnerStats(winnerId, loserId, matchId);
    } else {
      // Update the match document if only one player submitted
      await updateDoc(matchRef, updateData);
    }

    return true;
  } catch (error: any) {
    log.error('Error submitting solution', error);
    return false;
  }
};

// Get user's recent matches
export const getUserRecentMatches = async (userId: string, limitCount = 5): Promise<Match[]> => {
  try {
    const matchesRef = collection(db, COLLECTIONS.MATCHES);
    
    const queries = [
      query(matchesRef, where('player1', '==', userId), where('status', '==', MATCH_STATUS.COMPLETED)),
      query(matchesRef, where('player2', '==', userId), where('status', '==', MATCH_STATUS.COMPLETED))
    ];
    
    const [player1Matches, player2Matches] = await Promise.all([
      getDocs(queries[0]),
      getDocs(queries[1])
    ]);
    
    const allMatches: Match[] = [];
    
    [...player1Matches.docs, ...player2Matches.docs].forEach(doc => {
      allMatches.push({ id: doc.id, ...doc.data() } as Match);
    });
    
    return allMatches
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limitCount);
  } catch (error) {
    log.error('Error getting user matches', error);
    return [];
  }
};