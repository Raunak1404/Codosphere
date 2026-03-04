import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, app } from '../../config/firebase';
import { checkAdminAuth } from './admin';

export interface PlayerData {
  uid: string;
  name: string;
  coderName: string;
  email?: string;
  profileImage: string;
  selectedAvatar?: string;
  createdAt?: any;
  lastActive?: any;
  lastSolveDate?: string;
  isBanned?: boolean;
  bannedAt?: any;
  bannedReason?: string;
  stats: {
    problemsSolved: number;
    currentStreak: number;
    bestStreak: number;
    totalRankPoints: number;
    rankWins: number;
    rankMatches: number;
    rank: string;
    lastActive?: any;
  };
  solvedProblems: number[];
  achievements: any[];
}

const fns = getFunctions(app);

/**
 * Fetch all user documents — admin dashboard.
 * Direct Firestore read (any active user can read profiles per rules).
 */
export const getAllPlayers = async (): Promise<{
  players: PlayerData[];
  error: string | null;
}> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { players: [], error: authCheck.error! };
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('stats.problemsSolved', 'desc'));
    const snapshot = await getDocs(q);

    const players: PlayerData[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        name: data.name || 'Anonymous',
        coderName: data.coderName || '',
        email: data.email || '',
        profileImage: data.profileImage || '',
        selectedAvatar: data.selectedAvatar || 'boy1',
        createdAt: data.createdAt,
        lastActive: data.lastActive,
        lastSolveDate: data.lastSolveDate || '',
        isBanned: data.isBanned || false,
        bannedAt: data.bannedAt || null,
        bannedReason: data.bannedReason || '',
        stats: {
          problemsSolved: data.stats?.problemsSolved || 0,
          currentStreak: data.stats?.currentStreak || 0,
          bestStreak: data.stats?.bestStreak || 0,
          totalRankPoints: data.stats?.totalRankPoints || 0,
          rankWins: data.stats?.rankWins || 0,
          rankMatches: data.stats?.rankMatches || 0,
          rank: data.stats?.rank || 'Unranked',
          lastActive: data.stats?.lastActive || null,
        },
        solvedProblems: data.solvedProblems || [],
        achievements: data.achievements || [],
      };
    });

    return { players, error: null };
  } catch (error: any) {
    console.error('Error fetching all players:', error);
    return { players: [], error: error.message };
  }
};

/**
 * Ban or unban a player via Cloud Function.
 * The function sets the Firestore flag AND the `banned` custom claim,
 * then revokes refresh tokens for near-instant enforcement.
 */
export const banPlayer = async (
  userId: string,
  ban: boolean,
  reason?: string
): Promise<{ success: boolean; error?: string }> => {
  const authCheck = checkAdminAuth();
  if (!authCheck.isAuthorized) return { success: false, error: authCheck.error };

  try {
    const callable = httpsCallable(fns, 'adminBanPlayer');
    await callable({ userId, ban, reason });
    return { success: true };
  } catch (error: any) {
    console.error('Error banning/unbanning player:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Permanently delete a player via Cloud Function.
 * Deletes Storage files, Firestore document, and Firebase Auth user.
 */
export const deletePlayer = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  const authCheck = checkAdminAuth();
  if (!authCheck.isAuthorized) return { success: false, error: authCheck.error };

  try {
    const callable = httpsCallable(fns, 'adminDeletePlayer');
    await callable({ userId });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting player:', error);
    return { success: false, error: error.message };
  }
};
