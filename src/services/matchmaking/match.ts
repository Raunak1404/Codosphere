// Match retrieval, submission, and result processing
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  runTransaction,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS, MATCH_STATUS } from '../../config/constants';
import { Match } from './match.types';
import { updateMatchResults } from '../firebase/userStats';
import { deleteRoomForMatch, log } from './queue';

export interface SubmitMatchResult {
  success: boolean;
  matchCompleted?: boolean;
  winnerId?: string;
  loserId?: string;
}

export const autoUpdateWinnerStats = async (
  winnerId: string,
  loserId: string,
  matchId: string
): Promise<void> => {
  try {
    log.info(`Auto-updating stats for winner: ${winnerId}, loser: ${loserId}, match: ${matchId}`);

    // Small delay to let Firestore match-document write settle
    setTimeout(async () => {
      try {
        // updateMatchResults now uses a single atomic transaction that
        // reads + checks pointsAwarded + writes stats all in one go,
        // so there is no race window between clients.
        const result = await updateMatchResults(winnerId, loserId, matchId);
        if (result.success) {
          if (result.alreadyProcessed) {
            log.info(`Match ${matchId} stats already processed, skipping`);
          } else {
            log.info(`Successfully updated stats for match ${matchId}`);
          }
        } else {
          log.error(`Failed to update stats for match ${matchId}:`, result.error);
        }
      } catch (error) {
        log.error(`Error in auto-update stats for match ${matchId}:`, error);
      }
    }, 2000);
  } catch (error) {
    log.error('Error setting up auto-update stats', error);
  }
};

export const getMatch = async (matchId: string): Promise<Match | null> => {
  try {
    const matchSnap = await getDoc(doc(db, COLLECTIONS.MATCHES, matchId));
    if (matchSnap.exists()) {
      return { id: matchSnap.id, ...matchSnap.data() } as Match;
    }
    return null;
  } catch (error) {
    log.error('Error getting match', error);
    return null;
  }
};

/**
 * Forfeit a match — marks the given user as the loser and the opponent
 * as the winner. Used when a player leaves or disconnects.
 */
export const forfeitMatch = async (
  matchId: string,
  forfeitingUserId: string
): Promise<{ success: boolean; winnerId?: string; loserId?: string }> => {
  try {
    log.info(`Player ${forfeitingUserId} forfeiting match ${matchId}`);

    const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);

    const result = await runTransaction(db, async (transaction) => {
      const matchSnap = await transaction.get(matchRef);
      if (!matchSnap.exists()) throw new Error('Match not found');

      const matchData = matchSnap.data() as Omit<Match, 'id'>;

      // Already completed — nothing to do
      if (matchData.status === MATCH_STATUS.COMPLETED) {
        return { success: true, winnerId: matchData.winner };
      }

      // Determine winner (the player who did NOT forfeit)
      const winnerId =
        matchData.player1 === forfeitingUserId
          ? matchData.player2
          : matchData.player1;

      transaction.update(matchRef, {
        status: MATCH_STATUS.COMPLETED,
        winner: winnerId,
        forfeitedBy: forfeitingUserId,
        endTime: Date.now(),
      });

      return { success: true, winnerId, loserId: forfeitingUserId };
    });

    // Post-transaction: update stats + clean up room
    if (result.winnerId && result.loserId) {
      setTimeout(() => deleteRoomForMatch(matchId), 100);
      autoUpdateWinnerStats(result.winnerId, result.loserId, matchId);
    }

    return result;
  } catch (error: any) {
    log.error('Error forfeiting match', error);
    return { success: false };
  }
};

export const submitMatchSolution = async (
  matchId: string,
  userId: string,
  code: string,
  language: string,
  testCasesPassed: number,
  totalTestCases: number
): Promise<SubmitMatchResult> => {
  try {
    log.info(`Submitting solution for match: ${matchId}, user: ${userId}`);

    const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);

    // Use a transaction to ensure atomic read-modify-write.
    // Without this, two near-simultaneous submissions can both read the
    // match doc before either writes, causing each to think only one
    // player has submitted and leaving the match stuck in "in_progress".
    const result = await runTransaction(db, async (transaction) => {
      const matchSnap = await transaction.get(matchRef);

      if (!matchSnap.exists()) throw new Error('Match not found');

      const matchData = matchSnap.data() as Omit<Match, 'id'>;

      if (matchData.player1 !== userId && matchData.player2 !== userId) {
        throw new Error('User is not part of this match');
      }

      // Already submitted — return current state
      if (matchData.submissions?.[userId]) {
        const alreadyCompleted = matchData.status === MATCH_STATUS.COMPLETED;
        const winnerId = matchData.winner;
        const loserId = winnerId
          ? winnerId === matchData.player1
            ? matchData.player2
            : matchData.player1
          : undefined;
        return {
          success: true,
          matchCompleted: alreadyCompleted,
          winnerId: alreadyCompleted ? winnerId : undefined,
          loserId: alreadyCompleted ? loserId : undefined,
        } as SubmitMatchResult;
      }

      const submission = {
        code,
        language,
        submissionTime: Date.now(),
        testCasesPassed,
        totalTestCases,
      };

      const newSubmissions = { ...matchData.submissions, [userId]: submission };
      const bothSubmitted = !!(newSubmissions[matchData.player1] && newSubmissions[matchData.player2]);

      const updateData: any = {
        submissions: newSubmissions,
        status: bothSubmitted ? MATCH_STATUS.COMPLETED : MATCH_STATUS.IN_PROGRESS,
        pointsAwarded: matchData.pointsAwarded || false,
      };

      let winnerId: string | undefined;
      let loserId: string | undefined;

      if (bothSubmitted) {
        const p1Sub = newSubmissions[matchData.player1];
        const p2Sub = newSubmissions[matchData.player2];

        if (p1Sub.testCasesPassed > p2Sub.testCasesPassed) {
          winnerId = matchData.player1;
          loserId = matchData.player2;
        } else if (p2Sub.testCasesPassed > p1Sub.testCasesPassed) {
          winnerId = matchData.player2;
          loserId = matchData.player1;
        } else {
          // Tiebreaker: earlier submission wins
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
      }

      transaction.update(matchRef, updateData);

      return {
        success: true,
        matchCompleted: bothSubmitted,
        winnerId,
        loserId,
      } as SubmitMatchResult;
    });

    // Post-transaction side effects (only if match just completed)
    if (result.matchCompleted && result.winnerId && result.loserId) {
      setTimeout(() => deleteRoomForMatch(matchId), 100);
      autoUpdateWinnerStats(result.winnerId, result.loserId, matchId);
    }

    return result;
  } catch (error: any) {
    log.error('Error submitting solution', error);
    return { success: false };
  }
};

/**
 * Subscribe to real-time updates on a match document.
 * Returns an unsubscribe function.
 */
export const subscribeToMatch = (
  matchId: string,
  onUpdate: (match: Match) => void
): (() => void) => {
  const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
  return onSnapshot(
    matchRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate({ id: snapshot.id, ...snapshot.data() } as Match);
      }
    },
    (error) => log.error(`Error in match subscription for ${matchId}`, error)
  );
};

export const getUserRecentMatches = async (userId: string, limitCount = 5): Promise<Match[]> => {
  try {
    const matchesRef = collection(db, COLLECTIONS.MATCHES);

    const [player1Matches, player2Matches] = await Promise.all([
      getDocs(query(matchesRef, where('player1', '==', userId), where('status', '==', MATCH_STATUS.COMPLETED))),
      getDocs(query(matchesRef, where('player2', '==', userId), where('status', '==', MATCH_STATUS.COMPLETED))),
    ]);

    const allMatches: Match[] = [...player1Matches.docs, ...player2Matches.docs].map(
      (d) => ({ id: d.id, ...d.data() } as Match)
    );

    return allMatches
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limitCount);
  } catch (error) {
    log.error('Error getting user matches', error);
    return [];
  }
};
