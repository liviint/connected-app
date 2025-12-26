import { getDatabase } from './database';

/**
 * Save a journal locally
 */
export const upsertJournal = async (uuid, title, content, mood) => {
  const db = await getDatabase();
  const now = new Date().toISOString();

  try {
    await db.runAsync(
      `
      INSERT INTO journal_entries (
        uuid,
        title,
        content,
        mood_label,
        created_at,
        updated_at,
        synced
      )
      VALUES (?, ?, ?, ?, ?, ?, 0)
      ON CONFLICT(uuid) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        mood_label = excluded.mood_label,
        updated_at = excluded.updated_at,
        synced = 0
      `,
      [uuid, title, content, mood, now, now]
    );

    console.log("✅ Journal upserted locally");
  } catch (error) {
    console.error("❌ Failed to upsert journal:", error);
  }
};

export const deleteJournal = async (uuid) => {
  const db = await getDatabase();
  const now = new Date().toISOString();

  try {
    await db.runAsync(
      `
      UPDATE journal_entries
      SET deleted = 1,
          synced = 0,
          updated_at = ?
      WHERE uuid = ?
      `,
      [now, uuid]
    );

    console.log("🗑️ Journal marked as deleted locally");
  } catch (error) {
    console.error("❌ Failed to delete journal locally:", error);
  }
};



/**
 * Fetch all journals (local)
 */
export const getJournals = async (uuid = null) => {
  const db = await getDatabase();

  try {
    if (uuid) {
      // 🔹 Fetch single journal by UUID
      const journal = await db.getFirstAsync(
        `
        SELECT * FROM journal_entries
        WHERE uuid = ? AND deleted = 0
        LIMIT 1
        `,
        [uuid]
      );
      return journal;
    }

    // 🔹 Fetch all journals
    const rows = await db.getAllAsync(
      `
      SELECT * FROM journal_entries
      WHERE deleted = 0
      ORDER BY created_at DESC
      `
    );

    return rows;
  } catch (error) {
    console.error("❌ Failed to fetch journals:", error);
    return uuid ? null : [];
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
  await db.execAsync('BEGIN TRANSACTION')

  try {
    for (const journal of journals) {
      const uuid = String(journal.uuid); 

      if (!uuid) {
        console.warn('⛔ Journal missing uuid, skipping:', journal);
        continue;
      }

      // Check local state
      const existing = await db.getFirstAsync(
        `SELECT synced FROM journal_entries WHERE uuid = ?`,
        [uuid]
      );

      // Protect local unsynced edits
      if (existing && existing.synced === 0) {
        continue;
      }

      // Insert if missing
      await db.runAsync(
        `
        INSERT OR IGNORE INTO journal_entries (
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
          uuid,
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

      // Update safely
      await db.runAsync(
        `
        UPDATE journal_entries
        SET
          title = ?,
          content = ?,
          audio_uri = ?,
          transcript = ?,
          mood_id = ?,
          mood_label = ?,
          updated_at = ?,
          synced = 1,
          deleted = 0
        WHERE uuid = ?
          AND synced = 1
        `,
        [
          journal.title || '',
          journal.content || '',
          journal.audio_file || null,
          journal.transcript || null,
          journal.mood?.id || null,
          journal.mood?.name || null,
          journal.updated_at,
          uuid,
        ]
      );
    }

    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
};



