// Barrel export — import from here instead of individual modules
export { joinMatchmaking, cancelMatchmaking, cleanupExpiredRooms } from './queue';
export { getMatch, submitMatchSolution, getUserRecentMatches, autoUpdateWinnerStats, subscribeToMatch, forfeitMatch } from './match';
export type { SubmitMatchResult } from './match';
export { listenForMatch } from './listeners';
export type { Match, MatchQueueEntry, UserStats, UserProfile } from './match.types';
