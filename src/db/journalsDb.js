import { db } from './database';

/**
 * Create a journal entry (offline-first)
 */
export const createJournal = (uuid, title, content, mood) => {
  const now = new Date().toISOString();

  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO journal_entries 
        (uuid, title, content, mood_label, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [uuid, title, content, mood, now, now],
      () => {
        console.log('✅ Journal saved locally');
      },
      (_, error) => {
        console.error('❌ Failed to save journal:', error);
        return true;
      }
    );
  });
};

/**
 * Fetch all journals (local)
 */
export const getJournals = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM journal_entries 
       WHERE deleted = 0
       ORDER BY created_at DESC`,
      [],
      (_, result) => {
        callback(result.rows._array);
      },
      (_, error) => {
        console.error('❌ Failed to fetch journals:', error);
        return true;
      }
    );
  });
};

/**
 * Mark journal as synced after API success
 */
export const markJournalSynced = (uuid) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE journal_entries 
       SET synced = 1 
       WHERE uuid = ?`,
      [uuid],
      () => {
        console.log('✅ Journal marked as synced');
      },
      (_, error) => {
        console.error('❌ Failed to mark synced:', error);
        return true;
      }
    );
  });
};
