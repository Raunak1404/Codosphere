import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { requireAdmin } from '../utils/auth';
import { COLLECTIONS } from '../config/constants';

const db = getFirestore();

/**
 * Create a new problem document. Admin-only.
 */
export const adminCreateProblem = onCall(async (request) => {
  const callerUid = requireAdmin(request);

  const { problemData } = request.data as { problemData: Record<string, unknown> };
  if (!problemData || typeof problemData !== 'object') {
    throw new HttpsError('invalid-argument', 'problemData object is required.');
  }

  const docRef = await db.collection(COLLECTIONS.PROBLEMS).add({
    ...problemData,
    createdBy: callerUid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, problemId: docRef.id };
});

/**
 * Update an existing problem document. Admin-only.
 */
export const adminUpdateProblem = onCall(async (request) => {
  requireAdmin(request);

  const { problemId, problemData } = request.data as {
    problemId: string;
    problemData: Record<string, unknown>;
  };

  if (!problemId || typeof problemId !== 'string') {
    throw new HttpsError('invalid-argument', 'problemId (string) is required.');
  }
  if (!problemData || typeof problemData !== 'object') {
    throw new HttpsError('invalid-argument', 'problemData object is required.');
  }

  const problemRef = db.collection(COLLECTIONS.PROBLEMS).doc(problemId);
  const snap = await problemRef.get();
  if (!snap.exists) {
    throw new HttpsError('not-found', `Problem ${problemId} not found.`);
  }

  await problemRef.update({
    ...problemData,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * Delete a problem document and its associated Storage file. Admin-only.
 */
export const adminDeleteProblem = onCall(async (request) => {
  requireAdmin(request);

  const { problemId } = request.data as { problemId: string };
  if (!problemId || typeof problemId !== 'string') {
    throw new HttpsError('invalid-argument', 'problemId (string) is required.');
  }

  const problemRef = db.collection(COLLECTIONS.PROBLEMS).doc(problemId);
  const snap = await problemRef.get();

  if (snap.exists) {
    const data = snap.data()!;
    // Best-effort: delete the associated content file from Storage
    if (data.contentFileUrl) {
      try {
        const bucket = getStorage().bucket();
        // Extract the path from the download URL
        const url: string = data.contentFileUrl;
        const pathMatch = url.match(/\/o\/(.+?)\?/);
        if (pathMatch?.[1]) {
          const filePath = decodeURIComponent(pathMatch[1]);
          await bucket.file(filePath).delete();
        }
      } catch {
        // Non-fatal — file may already be deleted
        console.warn(`Could not delete storage file for problem ${problemId}`);
      }
    }
    await problemRef.delete();
  }

  return { success: true };
});
