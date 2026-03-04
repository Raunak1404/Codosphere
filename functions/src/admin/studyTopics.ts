import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { requireAdmin } from '../utils/auth';
import { COLLECTIONS } from '../config/constants';

const db = getFirestore();

/**
 * Create a new study topic document. Admin-only.
 */
export const adminCreateStudyTopic = onCall(async (request) => {
  const callerUid = requireAdmin(request);

  const { topicData } = request.data as { topicData: Record<string, unknown> };
  if (!topicData || typeof topicData !== 'object') {
    throw new HttpsError('invalid-argument', 'topicData object is required.');
  }

  const docRef = await db.collection(COLLECTIONS.STUDY_TOPICS).add({
    ...topicData,
    createdBy: callerUid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, topicId: docRef.id };
});

/**
 * Update an existing study topic document. Admin-only.
 */
export const adminUpdateStudyTopic = onCall(async (request) => {
  requireAdmin(request);

  const { topicId, topicData } = request.data as {
    topicId: string;
    topicData: Record<string, unknown>;
  };

  if (!topicId || typeof topicId !== 'string') {
    throw new HttpsError('invalid-argument', 'topicId (string) is required.');
  }
  if (!topicData || typeof topicData !== 'object') {
    throw new HttpsError('invalid-argument', 'topicData object is required.');
  }

  const topicRef = db.collection(COLLECTIONS.STUDY_TOPICS).doc(topicId);
  const snap = await topicRef.get();
  if (!snap.exists) {
    throw new HttpsError('not-found', `Study topic ${topicId} not found.`);
  }

  await topicRef.update({
    ...topicData,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * Delete a study topic document. Admin-only.
 */
export const adminDeleteStudyTopic = onCall(async (request) => {
  requireAdmin(request);

  const { topicId } = request.data as { topicId: string };
  if (!topicId || typeof topicId !== 'string') {
    throw new HttpsError('invalid-argument', 'topicId (string) is required.');
  }

  const topicRef = db.collection(COLLECTIONS.STUDY_TOPICS).doc(topicId);
  const snap = await topicRef.get();

  if (snap.exists) {
    await topicRef.delete();
  }

  return { success: true };
});
