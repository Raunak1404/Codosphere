import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { requireAdmin } from '../utils/auth';
import { COLLECTIONS } from '../config/constants';

const db = getFirestore();

/**
 * Ban or unban a player.
 * Sets/clears the `isBanned` Firestore field AND sets the `banned` custom claim
 * so Firestore rules can enforce the ban without an extra read.
 * Revokes refresh tokens so the claim takes effect on the next token refresh.
 */
export const adminBanPlayer = onCall(async (request) => {
  requireAdmin(request);

  const { userId, ban, reason } = request.data as {
    userId: string;
    ban: boolean;
    reason?: string;
  };

  if (!userId || typeof userId !== 'string') {
    throw new HttpsError('invalid-argument', 'userId (string) is required.');
  }
  if (typeof ban !== 'boolean') {
    throw new HttpsError('invalid-argument', 'ban (boolean) is required.');
  }

  const userRef = db.collection(COLLECTIONS.USERS).doc(userId);

  if (ban) {
    await Promise.all([
      userRef.update({
        isBanned: true,
        bannedAt: FieldValue.serverTimestamp(),
        bannedReason: reason || 'Banned by admin',
      }),
      // Set banned custom claim so Firestore rules can enforce it
      getAuth().setCustomUserClaims(userId, { banned: true }),
    ]);
  } else {
    await Promise.all([
      userRef.update({
        isBanned: false,
        bannedAt: null,
        bannedReason: '',
      }),
      getAuth().setCustomUserClaims(userId, { banned: false }),
    ]);
  }

  // Revoke refresh tokens so the claim takes effect on next login
  await getAuth().revokeRefreshTokens(userId);

  return { success: true };
});

/**
 * Permanently delete a player's account:
 * 1. Best-effort delete profile images from Storage
 * 2. Delete the Firestore user document
 * 3. Delete the Firebase Auth user record (now possible with Admin SDK)
 */
export const adminDeletePlayer = onCall(async (request) => {
  requireAdmin(request);

  const { userId } = request.data as { userId: string };
  if (!userId || typeof userId !== 'string') {
    throw new HttpsError('invalid-argument', 'userId (string) is required.');
  }

  // 1. Best-effort: delete profile images from Storage
  try {
    const bucket = getStorage().bucket();
    const [files] = await bucket.getFiles({ prefix: `profileImages/${userId}_` });
    await Promise.all(files.map((file) => file.delete()));
  } catch {
    console.warn(`Could not clean up storage files for user ${userId}`);
  }

  // 2. Delete Firestore user document
  await db.collection(COLLECTIONS.USERS).doc(userId).delete();

  // 3. Delete Firebase Auth user (Admin SDK — not possible client-side)
  try {
    await getAuth().deleteUser(userId);
  } catch {
    // Auth user may not exist (e.g. already deleted) — non-fatal
    console.warn(`Could not delete Auth user ${userId}`);
  }

  return { success: true };
});
