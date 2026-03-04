// Barrel export — import from here instead of individual modules
export { register, login, logout, getCurrentUser } from './auth';
export { getUserProfile, updateUserProfile, uploadProfileImage } from './userProfile';
export { updateProblemSolved } from './userStats';
export { getLeaderboard, getUserRankPosition, getProblemSolvers } from './leaderboard';
export { checkAdminAuth } from './admin';
export type { AdminProblem } from './problems';
export type { FunctionMeta, ParamDef } from '../api/wrapperGenerator';
export {
  createProblem,
  updateProblem,
  deleteProblem,
  getAllProblems,
  getProblemById,
  getPublicProblems,
  uploadProblemFile,
} from './problems';
export {
  getAllPlayers,
  banPlayer,
  deletePlayer,
} from './playerManagement';
export type { PlayerData } from './playerManagement';
export type { AdminStudyTopic, TopicSection, PracticeProblem } from './studyTopics';
export {
  createStudyTopic,
  updateStudyTopic,
  deleteStudyTopic,
  getAllStudyTopics,
  getPublicStudyTopics,
} from './studyTopics';
export { auth, db, storage, app } from '../../config/firebase';
