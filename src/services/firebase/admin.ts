import { auth } from '../../config/firebase';
import { env } from '../../config/env';

// Admin UIDs loaded from environment variables (never hardcode)
const ADMIN_UIDS: string[] = env.adminUids;

export const isAdmin = (user: any): boolean => {
  if (!user || !user.uid) return false;
  return ADMIN_UIDS.includes(user.uid);
};

// Helper used internally by problem service functions
export const checkAdminAuth = (): { isAuthorized: boolean; error?: string } => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return { isAuthorized: false, error: 'User not authenticated. Please log in first.' };
  }

  if (!isAdmin(currentUser)) {
    return { isAuthorized: false, error: 'Unauthorized: Admin access required.' };
  }

  return { isAuthorized: true };
};
