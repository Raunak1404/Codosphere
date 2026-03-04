import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '../utils/auth';
import { COLLECTIONS } from '../config/constants';

const db = getFirestore();

/**
 * Callable: record that the authenticated user solved a problem.
 * Handles streak logic and problem-solved count entirely server-side,
 * preventing clients from manipulating stats directly.
 */
export const recordProblemSolved = onCall(async (request) => {
  const uid = requireAuth(request);

  const { problemId } = request.data as { problemId: number };
  if (typeof problemId !== 'number') {
    throw new HttpsError('invalid-argument', 'problemId (number) is required.');
  }

  const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User document not found.');
  }

  const userData = userDoc.data()!;
  const solvedProblems: number[] = userData.solvedProblems || [];

  // Idempotent: no-op if already solved
  if (solvedProblems.includes(problemId)) {
    return { success: true, alreadySolved: true };
  }

  solvedProblems.push(problemId);

  // Streak calculation
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const lastSolveDate: string = userData.lastSolveDate || '';

  let currentStreak: number = userData.stats?.currentStreak || 0;
  let bestStreak: number = userData.stats?.bestStreak || 0;

  if (lastSolveDate !== todayStr) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

    currentStreak = lastSolveDate === yesterdayStr ? currentStreak + 1 : 1;
    bestStreak = Math.max(bestStreak, currentStreak);
  }

  await userRef.update({
    solvedProblems,
    'stats.problemsSolved': solvedProblems.length,
    'stats.currentStreak': currentStreak,
    'stats.bestStreak': bestStreak,
    lastSolveDate: todayStr,
    lastActive: FieldValue.serverTimestamp(),
  });

  return { success: true, alreadySolved: false };
});
