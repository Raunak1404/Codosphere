import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';

export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { data: docSnap.data(), error: null };
    }

    // Profile doesn't exist — create it with defaults
    const userData = {
      uid: userId,
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
    };

    await setDoc(docRef, userData);
    return { data: userData, error: null };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return { data: null, error: error.message };
  }
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: userId,
        name: profileData.name || 'New User',
        coderName: profileData.coderName || '',
        profileImage: profileData.profileImage || '',
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
    } else {
      await updateDoc(userRef, {
        ...profileData,
        lastActive: serverTimestamp(),
      });
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: "Permission denied: You don't have access to update this profile. Please check Firebase security rules.",
      };
    }
    return { success: false, error: error.message };
  }
};

export const uploadProfileImage = async (userId: string, file: File) => {
  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file');
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      throw new Error('Image size should be less than 5MB');
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${userId}_${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, `profileImages/${filename}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    const updateResult = await updateUserProfile(userId, { profileImage: downloadURL });
    if (!updateResult.success) {
      throw new Error(updateResult.error || 'Failed to update profile with new image');
    }

    return { url: downloadURL, error: null };
  } catch (error: any) {
    console.error('Error uploading profile image:', error);
    if (error.code === 'storage/unauthorized') {
      return { url: null, error: 'Permission denied: You need to be logged in to upload images' };
    }
    if (error.code === 'storage/canceled') {
      return { url: null, error: 'Upload was cancelled' };
    }
    if (error.code === 'storage/unknown') {
      return { url: null, error: 'An unknown error occurred during upload' };
    }
    return { url: null, error: error.message || 'Failed to upload image' };
  }
};
