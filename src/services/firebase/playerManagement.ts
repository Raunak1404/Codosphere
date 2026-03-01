import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
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

/**
 * Fetch all user documents from the `users` collection.
 * Admin-only — checks auth before querying.
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
    if (error.code === 'permission-denied') {
      return {
        players: [],
        error:
          'Firebase permission denied. Please configure Firestore security rules to allow admin read access to the users collection.',
      };
    }
    return { players: [], error: error.message };
  }
};

/**
 * Ban or unban a player. Sets/clears the `isBanned` flag on the user doc.
 * The app should check this flag during login / usage to enforce the ban.
 */
export const banPlayer = async (
  userId: string,
  ban: boolean,
  reason?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    const userRef = doc(db, 'users', userId);

    if (ban) {
      await updateDoc(userRef, {
        isBanned: true,
        bannedAt: serverTimestamp(),
        bannedReason: reason || 'Banned by admin',
      });
    } else {
      await updateDoc(userRef, {
        isBanned: false,
        bannedAt: null,
        bannedReason: '',
      });
    }

    console.log(`Player ${userId} ${ban ? 'banned' : 'unbanned'} successfully`);
    return { success: true };
  } catch (error: any) {
    console.error('Error banning/unbanning player:', error);
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error:
          'Firebase permission denied. Please configure Firestore security rules to allow admin write access to the users collection.',
      };
    }
    return { success: false, error: error.message };
  }
};

/**
 * Delete a player's account completely:
 * 1. Delete their profile image from Storage (if any)
 * 2. Delete the user document from Firestore
 *
 * Note: This does NOT delete the Firebase Auth user — that requires the
 * Firebase Admin SDK (server-side). The Firestore doc is the source of truth
 * for the app; the orphaned Auth record will simply have no profile data.
 */
export const deletePlayer = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    // Best-effort: delete profile images from Storage
    try {
      const imagesRef = ref(storage, 'profileImages');
      const imagesList = await listAll(imagesRef);
      const userImages = imagesList.items.filter((item) =>
        item.name.startsWith(`${userId}_`)
      );
      await Promise.all(userImages.map((item) => deleteObject(item)));
    } catch {
      // Storage might not have images — that's fine
      console.warn('Could not clean up storage files for user', userId);
    }

    // Delete the Firestore user document
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);

    console.log(`Player ${userId} deleted successfully`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting player:', error);
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error:
          'Firebase permission denied. Please configure Firestore security rules to allow admin delete access to the users collection.',
      };
    }
    return { success: false, error: error.message };
  }
};
