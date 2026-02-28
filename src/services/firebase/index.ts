// Barrel export — import from here instead of individual modules
export { register, login, logout, getCurrentUser } from './auth';
export { getUserProfile, updateUserProfile, uploadProfileImage } from './userProfile';
export { updateProblemSolved, updateMatchResults, updateUserRanks } from './userStats';
export { getLeaderboard, getUserRankPosition, getProblemSolvers } from './leaderboard';
export { isAdmin, checkAdminAuth } from './admin';
export type { AdminProblem } from './problems';
export {
  createProblem,
  updateProblem,
  deleteProblem,
  getAllProblems,
  getProblemById,
  getPublicProblems,
  uploadProblemFile,
} from './problems';
export { auth, db, storage, app } from '../../config/firebase';
