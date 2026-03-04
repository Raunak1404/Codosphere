import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { COLLECTIONS } from '../config/constants';

const db = getFirestore();

/**
 * Daily at midnight UTC: reset currentStreak to 0 for users who haven't solved
 * a problem today or yesterday (their streak is broken).
 */
export const resetBrokenStreaks = onSchedule(
  { schedule: '0 0 * * *', timeZone: 'UTC', timeoutSeconds: 120 },
  async () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

    // Only fetch users with an active streak (avoids scanning the whole collection)
    const usersSnap = await db
      .collection(COLLECTIONS.USERS)
      .where('stats.currentStreak', '>', 0)
      .get();

    const batch = db.batch();
    let count = 0;

    for (const docSnap of usersSnap.docs) {
      const lastSolve: string = docSnap.data().lastSolveDate || '';
      if (lastSolve !== todayStr && lastSolve !== yesterdayStr) {
        batch.update(docSnap.ref, { 'stats.currentStreak': 0 });
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`Reset streak for ${count} users.`);
    }
  }
);
