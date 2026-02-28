import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export const register = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Create initial user profile in Firestore
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      uid: userCredential.user.uid,
      email: email,
      name: 'New User',
      coderName: '',
      profileImage: '',
      createdAt: serverTimestamp(),
      stats: {
        problemsSolved: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalRankPoints: 0,
        rankWins: 0,
        rankMatches: 0,
        rank: 'Unranked',
        lastActive: serverTimestamp(),
      },
      achievements: [],
      solvedProblems: [],
      lastActive: serverTimestamp(),
    });

    return { user: userCredential.user, error: null };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return { user: null, error: 'Account already exists. Please log in.' };
    }
    return { user: null, error: error.message };
  }
};

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Update last active timestamp
    const userRef = doc(db, 'users', userCredential.user.uid);
    await updateDoc(userRef, { lastActive: serverTimestamp() });

    return { user: userCredential.user, error: null };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return { user: null, error: 'No account found. Please sign up.' };
    }
    return { user: null, error: error.message };
  }
};

export const logout = async () => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { lastActive: serverTimestamp() });
    }
    await signOut(auth);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
