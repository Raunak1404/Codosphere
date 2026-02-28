// Real-time Firestore listeners for match discovery and status updates
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS, ROOM_STATUS, MATCH_STATUS } from '../../config/constants';
import { Match } from './match.types';
import { log } from './queue';

interface MatchRoom {
  players: string[];
  status: string;
  matchId?: string;
}

export const listenForMatch = (
  userId: string,
  onMatchFound: (match: Match) => void,
  onMatchUpdate: (match: Match) => void
): (() => void) => {
  log.info(`Setting up enhanced match listeners for user: ${userId}`);

  const unsubscribeFunctions: (() => void)[] = [];
  const processedMatches = new Set<string>();
  const matchesRef = collection(db, COLLECTIONS.MATCHES);

  // 1. Direct match creation listeners (most reliable)
  const directMatchQueries = [
    query(matchesRef, where('player1', '==', userId), where('status', '==', MATCH_STATUS.MATCHED)),
    query(matchesRef, where('player2', '==', userId), where('status', '==', MATCH_STATUS.MATCHED)),
  ];

  directMatchQueries.forEach((matchQuery, index) => {
    const unsub = onSnapshot(
      matchQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const match = { id: change.doc.id, ...change.doc.data() } as Match;
          if (change.type === 'added' && !processedMatches.has(match.id)) {
            log.info(`NEW MATCH via direct listener ${index} for user ${userId}: ${match.id}`);
            processedMatches.add(match.id);
            onMatchFound(match);
          } else if (change.type === 'modified') {
            log.info(`Match ${match.id} updated for user ${userId}`);
            onMatchUpdate(match);
          }
        });
      },
      (error) => log.error(`Error in direct match listener ${index}`, error)
    );
    unsubscribeFunctions.push(unsub);
  });

  // 2. Backup: Room update listener
  const userRoomQuery = query(
    collection(db, COLLECTIONS.MATCH_ROOMS),
    where('players', 'array-contains', userId)
  );

  const roomUnsub = onSnapshot(
    userRoomQuery,
    async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        const roomData = change.doc.data() as MatchRoom;
        log.info(`Room ${change.doc.id} ${change.type} for user ${userId}:`, {
          status: roomData.status,
          hasMatchId: !!roomData.matchId,
        });

        if (roomData.status === ROOM_STATUS.MATCHED && roomData.matchId) {
          if (!processedMatches.has(roomData.matchId)) {
            try {
              const matchSnap = await getDoc(doc(db, COLLECTIONS.MATCHES, roomData.matchId));
              if (matchSnap.exists()) {
                const match = { id: matchSnap.id, ...matchSnap.data() } as Match;
                log.info(`BACKUP: Match found via room listener for user ${userId}: ${match.id}`);
                processedMatches.add(match.id);
                onMatchFound(match);

                // Clean up matched room after a short delay
                setTimeout(async () => {
                  try {
                    await deleteDoc(change.doc.ref);
                    log.info(`Cleaned up matched room: ${change.doc.id}`);
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
    },
    (error) => log.error('Error in room listener', error)
  );
  unsubscribeFunctions.push(roomUnsub);

  // 3. Match status update listeners (in_progress and completed)
  const updateMatchQueries = [
    query(matchesRef, where('player1', '==', userId), where('status', 'in', [MATCH_STATUS.IN_PROGRESS, MATCH_STATUS.COMPLETED])),
    query(matchesRef, where('player2', '==', userId), where('status', 'in', [MATCH_STATUS.IN_PROGRESS, MATCH_STATUS.COMPLETED])),
  ];

  updateMatchQueries.forEach((updateQuery, index) => {
    const unsub = onSnapshot(
      updateQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const match = { id: change.doc.id, ...change.doc.data() } as Match;
            log.info(`Match ${match.id} status updated to ${match.status} for user ${userId}`);
            onMatchUpdate(match);
          }
        });
      },
      (error) => log.error(`Error in update match listener ${index}`, error)
    );
    unsubscribeFunctions.push(unsub);
  });

  return () => {
    log.info(`Unsubscribing from all ${unsubscribeFunctions.length} matchmaking listeners`);
    unsubscribeFunctions.forEach((unsub) => unsub());
  };
};
