import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../../config/firebase';
import { checkAdminAuth } from './admin';

export interface AdminProblem {
  id?: string;
  numericId?: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  tags: string[];
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  /** Function signature metadata — enables auto-generated I/O wrappers */
  functionMeta?: {
    name: string;
    params: { name: string; type: string }[];
    returnType: string;
    className?: string;
  };
  /** Per-language starter code templates (overrides auto-generated) */
  starterCode?: { [language: string]: string };
  contentFileUrl?: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

const PROBLEMS_COLLECTION = 'problems';
const PROBLEM_FILES_FOLDER = 'problem-files';

const ALLOWED_FILE_TYPES = ['text/plain', 'text/markdown', 'application/pdf', 'text/html'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const uploadProblemFile = async (
  problemId: string,
  file: File
): Promise<{ url: string; error: string | null }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { url: '', error: authCheck.error! };
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { url: '', error: 'Invalid file type. Please upload .txt, .md, .pdf, or .html files only.' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { url: '', error: 'File size should be less than 10MB' };
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${problemId}_${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, `${PROBLEM_FILES_FOLDER}/${filename}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    console.log('Problem file uploaded successfully:', downloadURL);
    return { url: downloadURL, error: null };
  } catch (error: any) {
    console.error('Error uploading problem file:', error);
    return { url: '', error: error.message || 'Failed to upload file' };
  }
};

export const createProblem = async (
  problemData: Omit<AdminProblem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  contentFile?: File
): Promise<{ success: boolean; problemId?: string; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    const currentUser = auth.currentUser!;
    const problemsRef = collection(db, PROBLEMS_COLLECTION);
    const newProblem: AdminProblem = {
      ...problemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: currentUser.uid,
    };

    const docRef = await addDoc(problemsRef, newProblem);
    console.log('Problem created with ID:', docRef.id);

    if (contentFile) {
      const { url, error } = await uploadProblemFile(docRef.id, contentFile);
      if (error) {
        console.error('Error uploading content file:', error);
      } else if (url) {
        await updateDoc(docRef, { contentFileUrl: url });
      }
    }

    return { success: true, problemId: docRef.id };
  } catch (error: any) {
    console.error('Error creating problem:', error);
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Firebase permission denied. Please configure Firestore security rules to allow admin access to the problems collection.',
      };
    }
    return { success: false, error: error.message };
  }
};

export const updateProblem = async (
  problemId: string,
  problemData: Partial<AdminProblem>,
  contentFile?: File
): Promise<{ success: boolean; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    const problemRef = doc(db, PROBLEMS_COLLECTION, problemId);

    if (contentFile) {
      const { url, error } = await uploadProblemFile(problemId, contentFile);
      if (error) return { success: false, error };
      problemData.contentFileUrl = url;
    }

    await updateDoc(problemRef, { ...problemData, updatedAt: serverTimestamp() });
    console.log('Problem updated successfully:', problemId);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating problem:', error);
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Firebase permission denied. Please configure Firestore security rules to allow admin access to the problems collection.',
      };
    }
    return { success: false, error: error.message };
  }
};

export const deleteProblem = async (
  problemId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    const problemRef = doc(db, PROBLEMS_COLLECTION, problemId);
    const problemSnap = await getDoc(problemRef);

    if (problemSnap.exists()) {
      const problemData = problemSnap.data() as AdminProblem;
      if (problemData.contentFileUrl) {
        try {
          const fileRef = ref(storage, problemData.contentFileUrl);
          await deleteObject(fileRef);
        } catch {
          console.warn('Error deleting content file (may not exist)');
        }
      }
    }

    await deleteDoc(problemRef);
    console.log('Problem deleted successfully:', problemId);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting problem:', error);
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Firebase permission denied. Please configure Firestore security rules.',
      };
    }
    return { success: false, error: error.message };
  }
};

export const getAllProblems = async (): Promise<{ problems: AdminProblem[]; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { problems: [], error: authCheck.error };
    }

    const q = query(collection(db, PROBLEMS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const problems: AdminProblem[] = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as AdminProblem)
    );

    return { problems };
  } catch (error: any) {
    console.error('Error fetching problems:', error);
    if (error.code === 'permission-denied') {
      return {
        problems: [],
        error: 'Firebase permission denied. You need to configure Firestore security rules to allow admin access.',
      };
    }
    return { problems: [], error: error.message };
  }
};

export const getProblemById = async (
  problemId: string
): Promise<{ problem: AdminProblem | null; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { problem: null, error: authCheck.error };
    }

    const problemSnap = await getDoc(doc(db, PROBLEMS_COLLECTION, problemId));
    if (problemSnap.exists()) {
      return { problem: { id: problemSnap.id, ...problemSnap.data() } as AdminProblem };
    }
    return { problem: null, error: 'Problem not found' };
  } catch (error: any) {
    console.error('Error fetching problem:', error);
    if (error.code === 'permission-denied') {
      return {
        problem: null,
        error: 'Firebase permission denied. Please configure Firestore security rules.',
      };
    }
    return { problem: null, error: error.message };
  }
};

export const getPublicProblems = async (): Promise<AdminProblem[]> => {
  try {
    const q = query(collection(db, PROBLEMS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      numericId: parseInt(doc.id.slice(-6), 36),
    } as AdminProblem));
  } catch (error: any) {
    console.error('Error fetching public problems:', error);
    return [];
  }
};
