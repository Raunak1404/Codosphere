import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../config/firebase';

const fns = getFunctions(app);

/**
 * Record that the current user solved a problem.
 * Delegates entirely to the `recordProblemSolved` Cloud Function which handles
 * streak calculation and stat updates server-side.
 *
 * Note: userId param kept for API compatibility but the function derives UID
 * from the authenticated caller's token — clients cannot spoof it.
 */
export const updateProblemSolved = async (
  _userId: string,
  problemId: number,
  _solveTime: number
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const callable = httpsCallable<
      { problemId: number },
      { success: boolean; alreadySolved: boolean }
    >(fns, 'recordProblemSolved');

    await callable({ problemId });
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error recording problem solved:', error);
    return { success: false, error: error.message };
  }
};
