import {
  collection,
  getDocs,
  doc,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, storage, app } from '../../config/firebase';
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

const fns = getFunctions(app);

/**
 * Upload a problem content file to Storage.
 * Storage rules enforce admin-only writes — no extra auth check needed here.
 */
export const uploadProblemFile = async (
  problemId: string,
  file: File
): Promise<{ url: string; error: string | null }> => {
  try {
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

    return { url: downloadURL, error: null };
  } catch (error: any) {
    console.error('Error uploading problem file:', error);
    return { url: '', error: error.message || 'Failed to upload file' };
  }
};

/**
 * Create a new problem via Cloud Function (admin-only, enforced server-side).
 */
export const createProblem = async (
  problemData: Omit<AdminProblem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  contentFile?: File
): Promise<{ success: boolean; problemId?: string; error?: string }> => {
  const authCheck = checkAdminAuth();
  if (!authCheck.isAuthorized) return { success: false, error: authCheck.error };

  try {
    const callable = httpsCallable<{ problemData: unknown }, { success: boolean; problemId: string }>(
      fns, 'adminCreateProblem'
    );
    const result = await callable({ problemData });
    const { problemId } = result.data;

    // Upload content file if provided (Storage rules enforce admin claim)
    if (contentFile && problemId) {
      const { url, error } = await uploadProblemFile(problemId, contentFile);
      if (error) {
        console.error('Error uploading content file:', error);
      } else if (url) {
        const updateCallable = httpsCallable(fns, 'adminUpdateProblem');
        await updateCallable({ problemId, problemData: { contentFileUrl: url } });
      }
    }

    return { success: true, problemId };
  } catch (error: any) {
    console.error('Error creating problem:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing problem via Cloud Function (admin-only, enforced server-side).
 */
export const updateProblem = async (
  problemId: string,
  problemData: Partial<AdminProblem>,
  contentFile?: File
): Promise<{ success: boolean; error?: string }> => {
  const authCheck = checkAdminAuth();
  if (!authCheck.isAuthorized) return { success: false, error: authCheck.error };

  try {
    if (contentFile) {
      const { url, error } = await uploadProblemFile(problemId, contentFile);
      if (error) return { success: false, error };
      problemData.contentFileUrl = url;
    }

    const callable = httpsCallable(fns, 'adminUpdateProblem');
    await callable({ problemId, problemData });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating problem:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a problem (and its Storage file) via Cloud Function (admin-only).
 */
export const deleteProblem = async (
  problemId: string
): Promise<{ success: boolean; error?: string }> => {
  const authCheck = checkAdminAuth();
  if (!authCheck.isAuthorized) return { success: false, error: authCheck.error };

  try {
    const callable = httpsCallable(fns, 'adminDeleteProblem');
    await callable({ problemId });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting problem:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch all problems — admin dashboard use.
 * Direct Firestore read; Firestore rules allow any active user to read problems.
 */
export const getAllProblems = async (): Promise<{ problems: AdminProblem[]; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) return { problems: [], error: authCheck.error };

    const q = query(collection(db, PROBLEMS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const problems: AdminProblem[] = querySnapshot.docs.map(
      (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as AdminProblem)
    );

    return { problems };
  } catch (error: any) {
    console.error('Error fetching problems:', error);
    return { problems: [], error: error.message };
  }
};

/**
 * Fetch a single problem by Firestore document ID — admin dashboard use.
 */
export const getProblemById = async (
  problemId: string
): Promise<{ problem: AdminProblem | null; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) return { problem: null, error: authCheck.error };

    const problemSnap = await getDoc(doc(db, PROBLEMS_COLLECTION, problemId));
    if (problemSnap.exists()) {
      return { problem: { id: problemSnap.id, ...problemSnap.data() } as AdminProblem };
    }
    return { problem: null, error: 'Problem not found' };
  } catch (error: any) {
    console.error('Error fetching problem:', error);
    return { problem: null, error: error.message };
  }
};

/**
 * Fetch all problems for the public practice/study pages.
 */
export const getPublicProblems = async (): Promise<AdminProblem[]> => {
  try {
    const q = query(collection(db, PROBLEMS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
      numericId: parseInt(docSnap.id.slice(-6), 36),
    } as AdminProblem));
  } catch (error: any) {
    console.error('Error fetching public problems:', error);
    return [];
  }
};
