import {
  collection,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

export const getLeaderboard = async (category = 'global', limitCount = 10) => {
  try {
    console.log(`Getting ${category} leaderboard, limit: ${limitCount}`);

    const usersRef = collection(db, 'users');
    const sortField =
      category === 'rankPoints' ? 'stats.totalRankPoints' : 'stats.problemsSolved';

    const leaderboardQuery = query(usersRef, orderBy(sortField, 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(leaderboardQuery);

    console.log(`Found ${querySnapshot.size} users for ${category} leaderboard`);

    const leaderboardData = querySnapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Anonymous',
        coderName: data.coderName || '',
        selectedAvatar: data.selectedAvatar || 'boy1',
        rank: index + 1,
        stats: data.stats || {},
      };
    });

    return { data: leaderboardData, error: null };
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Get users who have solved a specific problem.
 * Returns up to `limitCount` solvers sorted by total problems solved (as a
 * proxy for skill). Firestore doesn't allow ordering by a field while using
 * array-contains, so we sort client-side.
 */
export const getProblemSolvers = async (problemId: number, limitCount = 10) => {
  try {
    const usersRef = collection(db, 'users');
    const solversQuery = query(
      usersRef,
      where('solvedProblems', 'array-contains', problemId),
    );
    const snapshot = await getDocs(solversQuery);

    const solvers = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Anonymous',
        coderName: data.coderName || '',
        selectedAvatar: data.selectedAvatar || 'boy1',
        stats: data.stats || {},
      };
    });

    // Sort by problems solved (desc) as a proxy for ranking
    solvers.sort((a, b) => (b.stats?.problemsSolved || 0) - (a.stats?.problemsSolved || 0));

    return { data: solvers.slice(0, limitCount), error: null };
  } catch (error: any) {
    console.error('Error fetching problem solvers:', error);
    return { data: [], error: error.message };
  }
};

export const getUserRankPosition = async (userId: string, category = 'global') => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const userPoints =
      category === 'rankPoints'
        ? userData.stats?.totalRankPoints || 0
        : userData.stats?.problemsSolved || 0;

    const pointsField =
      category === 'rankPoints' ? 'stats.totalRankPoints' : 'stats.problemsSolved';

    const higherPointsQuery = query(
      collection(db, 'users'),
      where(pointsField, '>', userPoints)
    );
    const higherPointsSnapshot = await getDocs(higherPointsQuery);

    return { rank: higherPointsSnapshot.size + 1, error: null };
  } catch (error: any) {
    console.error('Error getting user rank position:', error);
    return { rank: null, error: error.message };
  }
};
