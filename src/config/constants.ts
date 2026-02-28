// App-wide constants shared across frontend and services

// Rank thresholds (rank points required)
export const RANK_THRESHOLDS = {
  DIAMOND: 100,
  PLATINUM: 80,
  GOLD: 60,
  SILVER: 30,
  BRONZE: 1,
} as const;

export type RankName = 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Unranked';

export const getRankFromPoints = (points: number): RankName => {
  if (points >= RANK_THRESHOLDS.DIAMOND) return 'Diamond';
  if (points >= RANK_THRESHOLDS.PLATINUM) return 'Platinum';
  if (points >= RANK_THRESHOLDS.GOLD) return 'Gold';
  if (points >= RANK_THRESHOLDS.SILVER) return 'Silver';
  if (points > 0) return 'Bronze';
  return 'Unranked';
};

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  PROBLEMS: 'problems',
  MATCHES: 'matches',
  MATCH_ROOMS: 'matchRooms',
} as const;

// Matchmaking room status
export const ROOM_STATUS = {
  WAITING: 'waiting',
  MATCHED: 'matched',
  EXPIRED: 'expired',
} as const;

// Match status
export const MATCH_STATUS = {
  MATCHED: 'matched',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// Storage folder paths
export const STORAGE_PATHS = {
  PROFILE_IMAGES: 'profileImages',
  PROBLEM_FILES: 'problem-files',
} as const;

// Match timing
export const MATCH_TIMING = {
  ROOM_EXPIRY_MINUTES: 10,
  AUTO_STATS_DELAY_MS: 3000,
  ROOM_CLEANUP_DELAY_MS: 2000,
  ROOM_IMMEDIATE_CLEANUP_MS: 100,
} as const;
