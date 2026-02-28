import { doc, getDoc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getRankFromPoints } from '../../config/constants';

export const updateProblemSolved = async (
  userId: string,
  problemId: number,
  _solveTime: number // reserved for future use (time-based scoring)
) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();
    const solvedProblems: number[] = userData.solvedProblems || [];

    if (!solvedProblems.includes(problemId)) {
      solvedProblems.push(problemId);

      // Calculate streak
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      const lastSolveDate = userData.lastSolveDate || '';

      let currentStreak = userData.stats?.currentStreak || 0;
      let bestStreak = userData.stats?.bestStreak || 0;

      if (lastSolveDate !== todayStr) {
        // Check if the last solve was yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

        if (lastSolveDate === yesterdayStr) {
          currentStreak += 1;
        } else if (lastSolveDate !== todayStr) {
          // Streak broken — reset to 1
          currentStreak = 1;
        }
        bestStreak = Math.max(bestStreak, currentStreak);
      }

      await updateDoc(userRef, {
        solvedProblems,
        'stats.problemsSolved': solvedProblems.length,
        'stats.currentStreak': currentStreak,
        'stats.bestStreak': bestStreak,
        lastSolveDate: todayStr,
        lastActive: serverTimestamp(),
      });
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating problem solved status:', error);
    return { success: false, error: error.message };
  }
};

export const updateMatchResults = async (
  winnerId: string,
  loserId: string,
  matchId: string
) => {
  try {
    console.log('Updating match results - Winner:', winnerId, 'Loser:', loserId, 'Match:', matchId);

    let alreadyProcessed = false;

    await runTransaction(db, async (transaction) => {
      // Read the match doc INSIDE the transaction so the pointsAwarded
      // check-and-set is fully atomic — prevents both clients from awarding.
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await transaction.get(matchRef);

      if (matchDoc.exists() && matchDoc.data().pointsAwarded === true) {
        console.log(`Match ${matchId} already processed, skipping point awards`);
        alreadyProcessed = true;
        return;
      }

      const winnerRef = doc(db, 'users', winnerId);
      const loserRef = doc(db, 'users', loserId);

      const [winnerDoc, loserDoc] = await Promise.all([
        transaction.get(winnerRef),
        transaction.get(loserRef),
      ]);

      // Mark match as processed WITHIN the same transaction
      if (matchDoc.exists()) {
        transaction.update(matchRef, {
          pointsAwarded: true,
          pointsAwardedTimestamp: serverTimestamp(),
        });
      }

      if (winnerDoc.exists()) {
        const w = winnerDoc.data();
        transaction.update(winnerRef, {
          'stats.totalRankPoints': (w.stats?.totalRankPoints || 0) + 1,
          'stats.rankWins': (w.stats?.rankWins || 0) + 1,
          'stats.rankMatches': (w.stats?.rankMatches || 0) + 1,
          lastActive: serverTimestamp(),
        });
      } else {
        transaction.set(winnerRef, {
          uid: winnerId,
          name: 'New User',
          createdAt: serverTimestamp(),
          stats: {
            problemsSolved: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalRankPoints: 1,
            rankWins: 1,
            rankMatches: 1,
            rank: 'Bronze',
            lastActive: serverTimestamp(),
          },
          solvedProblems: [],
          lastActive: serverTimestamp(),
        });
      }

      if (loserDoc.exists()) {
        const l = loserDoc.data();
        transaction.update(loserRef, {
          'stats.rankMatches': (l.stats?.rankMatches || 0) + 1,
          lastActive: serverTimestamp(),
        });
      } else {
        transaction.set(loserRef, {
          uid: loserId,
          name: 'New User',
          createdAt: serverTimestamp(),
          stats: {
            problemsSolved: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalRankPoints: 0,
            rankWins: 0,
            rankMatches: 1,
            rank: 'Unranked',
            lastActive: serverTimestamp(),
          },
          solvedProblems: [],
          lastActive: serverTimestamp(),
        });
      }
    });

    if (alreadyProcessed) {
      return { success: true, error: null, alreadyProcessed: true };
    }

    await Promise.all([updateUserRanks(winnerId), updateUserRanks(loserId)]);

    console.log('Successfully updated winner and loser stats and ranks');
    return { success: true, error: null, alreadyProcessed: false };
  } catch (error: any) {
    console.error('Error updating match results:', error);
    return { success: false, error: error.message, alreadyProcessed: false };
  }
};

export const updateUserRanks = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const rankPoints = userDoc.data().stats?.totalRankPoints || 0;
    const newRank = getRankFromPoints(rankPoints);

    console.log(`User ${userId} has ${rankPoints} rank points, new rank: ${newRank}`);

    await updateDoc(userRef, {
      'stats.rank': newRank,
      lastActive: serverTimestamp(),
    });

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating user rank:', error);
    return { success: false, error: error.message };
  }
};
