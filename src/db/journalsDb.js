import { getDatabase } from './database';

/**
 * Save a journal locally
 */
export const createJournal = async (uuid, title, content, mood) => {
  const db = await getDatabase();
  const now = new Date().toISOString();

  try {
    await db.runAsync(
      `INSERT INTO journal_entries 
        (uuid, title, content, mood_label, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [uuid, title, content, mood, now, now]
    );
    console.log('✅ Journal saved locally');
  } catch (error) {
    console.error('❌ Failed to save journal:', error);
  }
};

/**
 * Fetch all journals (local)
 */
export const getJournals = async () => {
  const db = await getDatabase();
  try {
    const rows = await db.getAllAsync(
      `SELECT * FROM journal_entries 
       WHERE deleted = 0
       ORDER BY created_at DESC`
    );
    return rows;
  } catch (error) {
    console.error('❌ Failed to fetch journals:', error);
    return [];
  }
};

/**
 * Mark journal as synced after API success
 */
export const markJournalSynced = async (uuid) => {
  const db = await getDatabase();
  try {
    await db.runAsync(
      `UPDATE journal_entries 
       SET synced = 1 
       WHERE uuid = ?`,
      [uuid]
    );
    console.log('✅ Journal marked as synced');
  } catch (error) {
    console.error('❌ Failed to mark synced:', error);
  }
};


export const syncJournalsFromApi = async (journals) => {
  const db = await getDatabase()
  await db.execAsync('BEGIN TRANSACTION');

  try {
    for (const journal of journals) {
      await db.runAsync(
        `
        INSERT OR REPLACE INTO journal_entries (
          uuid,
          user_uuid,
          title,
          content,
          audio_uri,
          transcript,
          mood_id,
          mood_label,
          created_at,
          updated_at,
          synced,
          deleted
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
        `,
        [
          String(journal.id),
          String(journal.user),
          journal.title || '',
          journal.content || '',
          journal.audio_file || null,
          journal.transcript || null,
          journal.mood?.id || null,
          journal.mood?.name || null,
          journal.created_at,
          journal.updated_at,
        ]
      );
    }

    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
};

