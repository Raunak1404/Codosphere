// Rank thresholds — kept in sync with frontend src/config/constants.ts
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

export const COLLECTIONS = {
  USERS: 'users',
  PROBLEMS: 'problems',
  MATCHES: 'matches',
  MATCH_ROOMS: 'matchRooms',
  MATCHMAKING: 'matchmaking',
} as const;

export const MATCH_STATUS = {
  MATCHED: 'matched',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export const ROOM_STATUS = {
  WAITING: 'waiting',
  MATCHED: 'matched',
  EXPIRED: 'expired',
} as const;
