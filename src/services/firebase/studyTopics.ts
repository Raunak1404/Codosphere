import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, app } from '../../config/firebase';
import { checkAdminAuth } from './admin';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TopicSection {
  title: string;
  content: string;
  examples?: {
    language: string;
    code: string;
  }[];
}

export interface PracticeProblem {
  id: number;
  title: string;
  difficulty: string;
}

export interface AdminStudyTopic {
  id?: string;
  topicId: string;       // URL-safe slug, e.g. "arrays"
  title: string;
  icon: string;           // lucide-react icon name
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  problems: number;       // count of practice problems
  introduction: string;
  sections: TopicSection[];
  practiceProblems: PracticeProblem[];
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

const STUDY_TOPICS_COLLECTION = 'studyTopics';

const fns = getFunctions(app);

// ── Admin CRUD ───────────────────────────────────────────────────────────────

/**
 * Create a new study topic via Cloud Function (admin-only).
 */
export const createStudyTopic = async (
  topicData: Omit<AdminStudyTopic, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
): Promise<{ success: boolean; topicId?: string; error?: string }> => {
  const authCheck = checkAdminAuth();
  if (!authCheck.isAuthorized) return { success: false, error: authCheck.error };

  try {
    const callable = httpsCallable<{ topicData: unknown }, { success: boolean; topicId: string }>(
      fns, 'adminCreateStudyTopic'
    );
    const result = await callable({ topicData });
    return { success: true, topicId: result.data.topicId };
  } catch (error: any) {
    console.error('Error creating study topic:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing study topic via Cloud Function (admin-only).
 */
export const updateStudyTopic = async (
  topicId: string,
  topicData: Partial<AdminStudyTopic>
): Promise<{ success: boolean; error?: string }> => {
  const authCheck = checkAdminAuth();
  if (!authCheck.isAuthorized) return { success: false, error: authCheck.error };

  try {
    const callable = httpsCallable(fns, 'adminUpdateStudyTopic');
    await callable({ topicId, topicData });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating study topic:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a study topic via Cloud Function (admin-only).
 */
export const deleteStudyTopic = async (
  topicId: string
): Promise<{ success: boolean; error?: string }> => {
  const authCheck = checkAdminAuth();
  if (!authCheck.isAuthorized) return { success: false, error: authCheck.error };

  try {
    const callable = httpsCallable(fns, 'adminDeleteStudyTopic');
    await callable({ topicId });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting study topic:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch all study topics — admin dashboard use.
 */
export const getAllStudyTopics = async (): Promise<{ topics: AdminStudyTopic[]; error?: string }> => {
  try {
    const authCheck = checkAdminAuth();
    if (!authCheck.isAuthorized) return { topics: [], error: authCheck.error };

    const q = query(collection(db, STUDY_TOPICS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const topics: AdminStudyTopic[] = querySnapshot.docs.map(
      (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as AdminStudyTopic)
    );

    return { topics };
  } catch (error: any) {
    console.error('Error fetching study topics:', error);
    return { topics: [], error: error.message };
  }
};

/**
 * Fetch a single study topic by its URL slug (topicId field). Public read.
 */
export const getStudyTopicBySlug = async (slug: string): Promise<AdminStudyTopic | null> => {
  try {
    const q = query(
      collection(db, STUDY_TOPICS_COLLECTION),
      where('topicId', '==', slug)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as AdminStudyTopic;
  } catch (error) {
    console.error('Error fetching study topic by slug:', error);
    return null;
  }
};

/**
 * Fetch all study topics — public read (for user-facing pages).
 */
export const getPublicStudyTopics = async (): Promise<AdminStudyTopic[]> => {
  try {
    const q = query(collection(db, STUDY_TOPICS_COLLECTION), orderBy('title', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as AdminStudyTopic));
  } catch (error) {
    console.error('Error fetching public study topics:', error);
    return [];
  }
};
