import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK once
initializeApp();

// Admin — custom claims management
export { setAdminClaim, revokeAdminClaim } from './admin/setClaims';

// Admin — problem CRUD
export { adminCreateProblem, adminUpdateProblem, adminDeleteProblem } from './admin/problems';

// Admin — player management
export { adminBanPlayer, adminDeletePlayer } from './admin/playerManagement';

// Firestore triggers
export { onMatchComplete } from './triggers/onMatchComplete';

// Callable functions
export { recordProblemSolved } from './triggers/onProblemSolved';

// Scheduled functions
export { cleanupStaleRooms, cleanupStaleMatches } from './scheduled/cleanupRooms';
export { resetBrokenStreaks } from './scheduled/resetStreaks';
