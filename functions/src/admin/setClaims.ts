import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { requireAdmin } from '../utils/auth';

/**
 * Grant admin custom claim to a user.
 * Only callable by existing admins.
 */
export const setAdminClaim = onCall(async (request) => {
  requireAdmin(request);

  const { targetUid } = request.data as { targetUid: string };
  if (!targetUid || typeof targetUid !== 'string') {
    throw new HttpsError('invalid-argument', 'targetUid (string) is required.');
  }

  await getAuth().setCustomUserClaims(targetUid, { admin: true });
  // Revoke existing tokens so the new claim takes effect immediately
  await getAuth().revokeRefreshTokens(targetUid);

  return { success: true, message: `Admin claim set for ${targetUid}.` };
});

/**
 * Revoke admin custom claim from a user.
 * Only callable by existing admins.
 */
export const revokeAdminClaim = onCall(async (request) => {
  requireAdmin(request);

  const { targetUid } = request.data as { targetUid: string };
  if (!targetUid || typeof targetUid !== 'string') {
    throw new HttpsError('invalid-argument', 'targetUid (string) is required.');
  }

  await getAuth().setCustomUserClaims(targetUid, { admin: false });
  await getAuth().revokeRefreshTokens(targetUid);

  return { success: true, message: `Admin claim revoked for ${targetUid}.` };
});
