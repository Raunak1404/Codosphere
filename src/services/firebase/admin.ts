import { auth } from '../../config/firebase';

/**
 * Check if the given user object has the admin custom claim.
 * Uses the cached ID token result — no network request.
 * For security-critical checks, always rely on Firestore rules + Cloud Functions.
 */
export const isAdmin = async (user: { getIdTokenResult: (force?: boolean) => Promise<{ claims: Record<string, unknown> }> }): Promise<boolean> => {
  if (!user) return false;
  try {
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims['admin'] === true;
  } catch {
    return false;
  }
};

/**
 * Verify the current user is authenticated.
 * Admin enforcement is handled by the Cloud Functions themselves.
 * This is a lightweight client-side guard to avoid unnecessary network calls.
 */
export const checkAdminAuth = (): { isAuthorized: boolean; error?: string } => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { isAuthorized: false, error: 'User not authenticated. Please log in first.' };
  }
  return { isAuthorized: true };
};
