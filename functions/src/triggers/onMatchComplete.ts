import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getRankFromPoints } from '../config/constants';

const db = getFirestore();

/**
 * Firestore trigger: fires whenever a document in the `matches` collection is
 * created or updated. If the match has just transitioned to "completed" AND
 * `pointsAwarded` is still false, atomically award stats to winner and loser.
 *
 * This replaces the client-side `autoUpdateWinnerStats` / `updateMatchResults`
 * pattern that relied on a fragile `setTimeout(2000)` and could race.
 */
export const onMatchComplete = onDocumentWritten(
  'matches/{matchId}',
  async (event) => {
    const after = event.data?.after?.data();
    const before = event.data?.before?.data();

    // Only act when the match just became 'completed' and points not yet awarded
    if (
      !after ||
      after.status !== 'completed' ||
      after.pointsAwarded === true
    ) {
      return;
    }

    // Ignore if already completed before this write (no new transition)
    if (before?.status === 'completed') {
      return;
    }

    const matchId = event.params.matchId;
    const winnerId: string | undefined = after.winner;
    const player1: string = after.player1;
    const player2: string = after.player2;
    const loserId = winnerId
      ? winnerId === player1 ? player2 : player1
      : undefined;

    if (!winnerId || !loserId) {
      // Draw or no winner determined — just increment rankMatches for both
      const p1Ref = db.collection('users').doc(player1);
      const p2Ref = db.collection('users').doc(player2);
      await Promise.all([
        p1Ref.update({ 'stats.rankMatches': FieldValue.increment(1), lastActive: FieldValue.serverTimestamp() }),
        p2Ref.update({ 'stats.rankMatches': FieldValue.increment(1), lastActive: FieldValue.serverTimestamp() }),
        db.collection('matches').doc(matchId).update({ pointsAwarded: true, pointsAwardedTimestamp: FieldValue.serverTimestamp() }),
      ]);
      return;
    }

    const winnerRef = db.collection('users').doc(winnerId);
    const loserRef = db.collection('users').doc(loserId);
    const matchRef = db.collection('matches').doc(matchId);

    await db.runTransaction(async (tx) => {
      const [matchSnap, winnerSnap, loserSnap] = await Promise.all([
        tx.get(matchRef),
        tx.get(winnerRef),
        tx.get(loserRef),
      ]);

      // Double-check inside transaction — prevent double-award if trigger fires twice
      if (!matchSnap.exists || matchSnap.data()?.pointsAwarded === true) {
        return;
      }

      // Mark points awarded first (idempotency guard)
      tx.update(matchRef, {
        pointsAwarded: true,
        pointsAwardedTimestamp: FieldValue.serverTimestamp(),
      });

      // Update winner stats
      if (winnerSnap.exists) {
        const w = winnerSnap.data()!;
        const newWinnerPoints = (w.stats?.totalRankPoints || 0) + 1;
        const newWinnerRank = getRankFromPoints(newWinnerPoints);
        tx.update(winnerRef, {
          'stats.totalRankPoints': newWinnerPoints,
          'stats.rankWins': FieldValue.increment(1),
          'stats.rankMatches': FieldValue.increment(1),
          'stats.rank': newWinnerRank,
          lastActive: FieldValue.serverTimestamp(),
        });
      }

      // Update loser stats
      if (loserSnap.exists) {
        const l = loserSnap.data()!;
        const loserPoints = l.stats?.totalRankPoints || 0;
        const loserRank = getRankFromPoints(loserPoints);
        tx.update(loserRef, {
          'stats.rankMatches': FieldValue.increment(1),
          'stats.rank': loserRank,
          lastActive: FieldValue.serverTimestamp(),
        });
      }
    });
  }
);
