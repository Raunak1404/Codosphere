import { auth, db, storage } from './firebase';
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
  getDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Admin user IDs - in production, this should be in environment variables
const ADMIN_UIDS = [
  "6PoYJdCdqWQYZ66ue6sn6TZcTj33"
];

// Check if current user is admin
export const isAdmin = (user: any): boolean => {
  if (!user || !user.uid) return false;
  return ADMIN_UIDS.includes(user.uid);
};

// Helper function to check authentication and admin status
const checkAdminAuth = (): { isAuthorized: boolean; error?: string } => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return { 
      isAuthorized: false, 
      error: 'User not authenticated. Please log in first.' 
    };
  }
  
  if (!isAdmin(currentUser)) {
    return { 
      isAuthorized: false, 
      error: 'Unauthorized: Admin access required.' 
    };
  }
  
  return { isAuthorized: true };
};

// Problem interface for admin
export interface AdminProblem {
  id?: string;
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
  contentFileUrl?: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

// Collections
const PROBLEMS_COLLECTION = 'problems';
const PROBLEM_FILES_FOLDER = 'problem-files';

// Upload problem content file
export const uploadProblemFile = async (
  problemId: string, 
  file: File
): Promise<{ url: string; error: string | null }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { url: '', error: authCheck.error! };
    }

    // Validate file type
    const allowedTypes = [
      'text/plain', 
      'text/markdown', 
      'application/pdf',
      'text/html'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { 
        url: '', 
        error: 'Invalid file type. Please upload .txt, .md, .pdf, or .html files only.' 
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { 
        url: '', 
        error: 'File size should be less than 10MB' 
      };
    }

    // Create filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${problemId}_${timestamp}.${fileExtension}`;
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `${PROBLEM_FILES_FOLDER}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    console.log('Problem file uploaded successfully:', downloadURL);
    return { url: downloadURL, error: null };
  } catch (error: any) {
    console.error('Error uploading problem file:', error);
    return { 
      url: '', 
      error: error.message || 'Failed to upload file' 
    };
  }
};

// Create new problem
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

    // Create problem document
    const problemsRef = collection(db, PROBLEMS_COLLECTION);
    const newProblem: AdminProblem = {
      ...problemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: currentUser.uid
    };

    const docRef = await addDoc(problemsRef, newProblem);
    console.log('Problem created with ID:', docRef.id);

    // Upload content file if provided
    if (contentFile) {
      const { url, error } = await uploadProblemFile(docRef.id, contentFile);
      if (error) {
        console.error('Error uploading content file:', error);
        // Don't fail the entire operation, just log the error
      } else if (url) {
        // Update problem with content file URL
        await updateDoc(docRef, { contentFileUrl: url });
        console.log('Problem updated with content file URL');
      }
    }

    return { success: true, problemId: docRef.id };
  } catch (error: any) {
    console.error('Error creating problem:', error);
    
    // Provide specific error message for permissions
    if (error.code === 'permission-denied') {
      return { 
        success: false, 
        error: 'Firebase permission denied. Please configure Firestore security rules to allow admin access to the problems collection.' 
      };
    }
    
    return { success: false, error: error.message };
  }
};

// Update existing problem
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
    
    // Upload new content file if provided
    if (contentFile) {
      const { url, error } = await uploadProblemFile(problemId, contentFile);
      if (error) {
        return { success: false, error };
      }
      problemData.contentFileUrl = url;
    }

    // Update problem
    await updateDoc(problemRef, {
      ...problemData,
      updatedAt: serverTimestamp()
    });

    console.log('Problem updated successfully:', problemId);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating problem:', error);
    
    // Provide specific error message for permissions
    if (error.code === 'permission-denied') {
      return { 
        success: false, 
        error: 'Firebase permission denied. Please configure Firestore security rules to allow admin access to the problems collection.' 
      };
    }
    
    return { success: false, error: error.message };
  }
};

// Delete problem
export const deleteProblem = async (
  problemId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    // Get problem data to find content file
    const problemRef = doc(db, PROBLEMS_COLLECTION, problemId);
    const problemSnap = await getDoc(problemRef);
    
    if (problemSnap.exists()) {
      const problemData = problemSnap.data() as AdminProblem;
      
      // Delete content file from storage if exists
      if (problemData.contentFileUrl) {
        try {
          const fileRef = ref(storage, problemData.contentFileUrl);
          await deleteObject(fileRef);
          console.log('Content file deleted successfully');
        } catch (error) {
          console.warn('Error deleting content file (may not exist):', error);
        }
      }
    }

    // Delete problem document
    await deleteDoc(problemRef);
    console.log('Problem deleted successfully:', problemId);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting problem:', error);
    
    // Provide specific error message for permissions
    if (error.code === 'permission-denied') {
      return { 
        success: false, 
        error: 'Firebase permission denied. Please configure Firestore security rules to allow admin access to the problems collection.' 
      };
    }
    
    return { success: false, error: error.message };
  }
};

// Get all problems for admin
export const getAllProblems = async (): Promise<{
  problems: AdminProblem[];
  error?: string;
}> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { problems: [], error: authCheck.error };
    }

    const problemsRef = collection(db, PROBLEMS_COLLECTION);
    const q = query(problemsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const problems: AdminProblem[] = [];
    querySnapshot.forEach((doc) => {
      problems.push({ id: doc.id, ...doc.data() } as AdminProblem);
    });

    return { problems };
  } catch (error: any) {
    console.error('Error fetching problems:', error);
    
    // Provide specific error message for permissions
    if (error.code === 'permission-denied') {
      return { 
        problems: [], 
        error: 'Firebase permission denied. You need to configure Firestore security rules to allow admin access. Please add a rule like: allow read, write: if request.auth != null && request.auth.uid in ["6PoYJdCdqWQYZ66ue6sn6TZcTj33"];' 
      };
    }
    
    return { problems: [], error: error.message };
  }
};

// Get single problem by ID
export const getProblemById = async (
  problemId: string
): Promise<{ problem: AdminProblem | null; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) {
      return { problem: null, error: authCheck.error };
    }

    const problemRef = doc(db, PROBLEMS_COLLECTION, problemId);
    const problemSnap = await getDoc(problemRef);
    
    if (problemSnap.exists()) {
      const problem = { id: problemSnap.id, ...problemSnap.data() } as AdminProblem;
      return { problem };
    } else {
      return { problem: null, error: 'Problem not found' };
    }
  } catch (error: any) {
    console.error('Error fetching problem:', error);
    
    // Provide specific error message for permissions
    if (error.code === 'permission-denied') {
      return { 
        problem: null, 
        error: 'Firebase permission denied. Please configure Firestore security rules to allow admin access to the problems collection.' 
      };
    }
    
    return { problem: null, error: error.message };
  }
};

// Get public problems (for regular users)
export const getPublicProblems = async (): Promise<AdminProblem[]> => {
  try {
    const problemsRef = collection(db, PROBLEMS_COLLECTION);
    const q = query(problemsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const problems: AdminProblem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Convert to the format expected by existing code
      problems.push({
        id: doc.id,
        ...data,
        // Ensure numeric ID for compatibility
        numericId: parseInt(doc.id.slice(-6), 36) // Convert last 6 chars to number
      } as AdminProblem);
    });

    return problems;
  } catch (error: any) {
    console.error('Error fetching public problems:', error);
    return [];
  }
};