// Room and queue management for matchmaking
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { codingProblems } from '../../data/codingProblems';
import { COLLECTIONS, ROOM_STATUS, MATCH_STATUS } from '../../config/constants';
import { Match } from './match.types';

// Internal types
interface MatchRoom {
  id?: string;
  players: string[];
  status: string;
  createdAt: any;
  problemId?: number;
  matchId?: string;
}

// Logging utility (shared across matchmaking modules)
export const log = {
  info: (message: string, data?: any) => console.log(`[Matchmaking] ${message}`, data || ''),
  error: (message: string, error?: any) => console.error(`[Matchmaking Error] ${message}`, error || ''),
  warn: (message: string, data?: any) => console.warn(`[Matchmaking Warning] ${message}`, data || ''),
};

const getRandomProblem = (): number => {
  const randomIndex = Math.floor(Math.random() * codingProblems.length);
  return codingProblems[randomIndex].id;
};

export const cleanupExpiredRooms = async (): Promise<void> => {
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
      expiredRooms.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      log.info(`Cleaned up ${expiredRooms.size} expired rooms`);
    }
  } catch (error) {
    log.error('Error cleaning up expired rooms', error);
  }
};

export const getUserActiveRoom = async (userId: string): Promise<any | null> => {
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

export const getUserActiveMatch = async (userId: string): Promise<Match | null> => {
  try {
    const matchesRef = collection(db, COLLECTIONS.MATCHES);
    const activeStatuses = [MATCH_STATUS.MATCHED, MATCH_STATUS.IN_PROGRESS];

    const [player1Matches, player2Matches] = await Promise.all([
      getDocs(query(matchesRef, where('player1', '==', userId), where('status', 'in', activeStatuses))),
      getDocs(query(matchesRef, where('player2', '==', userId), where('status', 'in', activeStatuses))),
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

export const atomicJoinOrCreateRoom = async (
  userId: string
): Promise<{ type: 'joined' | 'created'; roomId: string; matchId?: string }> => {
  // A well-known lock document that every matchmaking transaction reads
  // and writes.  Firestore transactions use optimistic concurrency: if
  // two users start matchmaking simultaneously, both read this lock doc
  // via transaction.get().  One transaction commits first (writing to
  // the lock), which invalidates the other's read, forcing a retry.
  // On retry the second user sees the room created by the first and
  // joins it instead of creating a duplicate.
  const lockRef = doc(db, 'matchmaking', 'lock');

  return await runTransaction(db, async (transaction) => {
    log.info(`Starting atomic operation for user ${userId}`);

    // Read lock document — this is what forces contention between
    // concurrent transactions.
    await transaction.get(lockRef);

    const roomsRef = collection(db, COLLECTIONS.MATCH_ROOMS);
    const availableRoomsQuery = query(
      roomsRef,
      where('status', '==', ROOM_STATUS.WAITING),
      orderBy('createdAt', 'asc'),
      limit(10)
    );

    const availableRooms = await getDocs(availableRoomsQuery);
    log.info(`Found ${availableRooms.size} rooms to check`);

    for (const roomDoc of availableRooms.docs) {
      const roomData = roomDoc.data() as MatchRoom;

      if (roomData.players.length === 1 && !roomData.players.includes(userId)) {
        const opponentId = roomData.players[0];
        const problemId = getRandomProblem();

        const matchesRef = collection(db, COLLECTIONS.MATCHES);
        const newMatchRef = doc(matchesRef);

        transaction.set(newMatchRef, {
          player1: opponentId,
          player2: userId,
          problemId,
          startTime: Date.now(),
          status: MATCH_STATUS.MATCHED,
          submissions: {},
          pointsAwarded: false,
        });

        transaction.update(roomDoc.ref, {
          players: [opponentId, userId],
          status: ROOM_STATUS.MATCHED,
          problemId,
          matchId: newMatchRef.id,
        });

        // Always write the lock so that simultaneous transactions conflict
        transaction.set(lockRef, { lastUpdated: Date.now(), lastUser: userId });

        log.info(`Joined room ${roomDoc.id} and created match ${newMatchRef.id}`);
        return { type: 'joined', roomId: roomDoc.id, matchId: newMatchRef.id };
      }
    }

    // No available room — create one
    const newRoomRef = doc(collection(db, COLLECTIONS.MATCH_ROOMS));
    transaction.set(newRoomRef, {
      players: [userId],
      status: ROOM_STATUS.WAITING,
      createdAt: serverTimestamp(),
    });

    // Always write the lock so that simultaneous transactions conflict
    transaction.set(lockRef, { lastUpdated: Date.now(), lastUser: userId });

    log.info(`Created new room ${newRoomRef.id} for user ${userId}`);
    return { type: 'created', roomId: newRoomRef.id };
  });
};

export const deleteRoomForMatch = async (matchId: string): Promise<void> => {
  try {
    const roomQuery = query(
      collection(db, COLLECTIONS.MATCH_ROOMS),
      where('matchId', '==', matchId)
    );
    const roomSnapshot = await getDocs(roomQuery);

    if (!roomSnapshot.empty) {
      const batch = writeBatch(db);
      roomSnapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      log.info(`IMMEDIATE CLEANUP: Deleted ${roomSnapshot.size} room(s) for match ${matchId}`);
    }
  } catch (error) {
    log.error('Error deleting room for match', error);
  }
};

export const joinMatchmaking = async (userId: string): Promise<string> => {
  try {
    log.info(`User ${userId} joining matchmaking`);

    await cleanupExpiredRooms();

    const activeMatch = await getUserActiveMatch(userId);
    if (activeMatch) {
      // If the match is older than 2 minutes, it's stale from a previous
      // session.  Mark it completed so it stops blocking new matchmaking.
      const matchAge = Date.now() - (activeMatch.startTime || 0);
      const TWO_MINUTES = 2 * 60 * 1000;
      if (matchAge > TWO_MINUTES) {
        log.warn(`Cleaning up stale match ${activeMatch.id} for user ${userId} (${Math.round(matchAge / 1000)}s old)`);
        try {
          await updateDoc(doc(db, COLLECTIONS.MATCHES, activeMatch.id), { status: MATCH_STATUS.COMPLETED });
          // Also clean up any associated room
          await deleteRoomForMatch(activeMatch.id);
        } catch (cleanupErr) {
          log.error('Error cleaning up stale match', cleanupErr);
        }
        // Fall through to create/join a new room below
      } else {
        log.info(`User ${userId} already has active match: ${activeMatch.id}`);
        return activeMatch.id;
      }
    }

    const existingRoom = await getUserActiveRoom(userId);
    if (existingRoom) {
      log.warn(`User ${userId} is already in room ${existingRoom.id}`);
      return 'waiting';
    }

    const result = await atomicJoinOrCreateRoom(userId);
    log.info(`User ${userId} ${result.type} room ${result.roomId}`);

    return result.matchId ?? 'waiting';
  } catch (error: any) {
    log.error('Error in joinMatchmaking', error);
    throw new Error(`Matchmaking failed: ${error.message}`);
  }
};

export const cancelMatchmaking = async (userId: string): Promise<boolean> => {
  try {
    log.info(`Canceling matchmaking for user: ${userId}`);

    const userRoom = await getUserActiveRoom(userId);
    if (userRoom) {
      const roomData = userRoom.data() as MatchRoom;
      if (roomData.players.length === 1 && roomData.players[0] === userId) {
        await deleteDoc(userRoom.ref);
        log.info(`Deleted room ${userRoom.id} for user ${userId}`);
      } else {
        await updateDoc(userRoom.ref, {
          players: roomData.players.filter((p: string) => p !== userId),
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
