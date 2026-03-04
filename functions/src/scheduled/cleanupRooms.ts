import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { COLLECTIONS, ROOM_STATUS } from '../config/constants';

const db = getFirestore();

/**
 * Every 5 minutes: delete matchRooms in "waiting" status that are older than 10 minutes.
 * Replaces the client-side cleanupExpiredRooms() in queue.ts which only ran on matchmaking entry.
 */
export const cleanupStaleRooms = onSchedule(
  { schedule: 'every 5 minutes', timeoutSeconds: 60 },
  async () => {
    const tenMinutesAgo = Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 1000));

    const staleRooms = await db
      .collection(COLLECTIONS.MATCH_ROOMS)
      .where('status', '==', ROOM_STATUS.WAITING)
      .where('createdAt', '<', tenMinutesAgo)
      .get();

    if (staleRooms.empty) return;

    const batch = db.batch();
    staleRooms.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`Cleaned up ${staleRooms.size} stale waiting matchRooms.`);
  }
);

/**
 * Every 10 minutes: mark matches stuck in 'matched' or 'in_progress' for
 * more than 30 minutes as completed (timeout/abandoned).
 */
export const cleanupStaleMatches = onSchedule(
  { schedule: 'every 10 minutes', timeoutSeconds: 60 },
  async () => {
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    const staleMatches = await db
      .collection(COLLECTIONS.MATCHES)
      .where('status', 'in', ['matched', 'in_progress'])
      .get();

    const batch = db.batch();
    let count = 0;

    for (const docSnap of staleMatches.docs) {
      const data = docSnap.data();
      if (data.startTime && data.startTime < thirtyMinutesAgo) {
        batch.update(docSnap.ref, {
          status: 'completed',
          endTime: Date.now(),
        });
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`Marked ${count} stale matches as completed.`);
    }
  }
);
