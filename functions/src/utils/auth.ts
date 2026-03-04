import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';

/**
 * Throws an HttpsError if the caller is not authenticated with admin custom claim.
 * Call this at the top of every admin-only Cloud Function.
 */
export const requireAdmin = (request: CallableRequest): string => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Must be logged in.');
  }
  if (!request.auth?.token?.['admin']) {
    throw new HttpsError('permission-denied', 'Admin access required.');
  }
  return uid;
};

/**
 * Throws an HttpsError if the caller is not authenticated.
 * Returns the caller's UID.
 */
export const requireAuth = (request: CallableRequest): string => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Must be logged in.');
  }
  return uid;
};
