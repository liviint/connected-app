// journalsDb.js
import { DEFAULT_MOODS } from "../../utils/defaultMoods";

/**
 * Save a journal locally
 */
export const upsertJournal = async (db, { id, uuid, title, content, mood_id, mood_label }) => {
  const now = new Date().toISOString();

  try {
    await db.runAsync(
      `
      INSERT INTO journal_entries (
        id,
        uuid,
        title,
        content,
        mood_id,
        mood_label,
        created_at,
        updated_at,
        synced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
      ON CONFLICT(uuid) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        mood_id = excluded.mood_id,
        mood_label = excluded.mood_label,
        updated_at = excluded.updated_at,
        synced = 0
      `,
      [id, uuid, title, content, mood_id, mood_label, now, now]
    );
    console.log("✅ Journal upserted locally");
  } catch (error) {
    console.error("❌ Failed to upsert journal:", error);
  }
};

export const deleteJournal = async (db, uuid) => {
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
export const getJournals = async (db, uuid = null) => {
  try {
    if (uuid) {
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

export const getUnsyncedJournals = async (db) => {
  return db.getAllAsync(`SELECT * FROM journal_entries WHERE synced = 0`);
};

/**
 * Mark journal as synced after API success
 */
export const markJournalSynced = async (db, uuid) => {
  try {
    await db.runAsync(`UPDATE journal_entries SET synced = 1 WHERE uuid = ?`, [uuid]);
    console.log('✅ Journal marked as synced');
  } catch (error) {
    console.error('❌ Failed to mark journal as synced:', error);
  }
};

export const syncJournalsFromApi = async (db, journals) => {
  for (const journal of journals) {
    const uuid = String(journal.uuid);
    if (!uuid) {
      console.warn('⛔ Journal missing uuid, skipping:', journal);
      continue;
    }

    const existing = await db.getFirstAsync(
      `SELECT synced FROM journal_entries WHERE uuid = ?`,
      [uuid]
    );

    if (existing && existing.synced === 0) continue; // Preserve unsynced local edits

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
  }
};

export const seedMoodsIfNeeded = async (db) => {
  const existing = await db.getFirstAsync(`SELECT COUNT(*) as count FROM moods`);
  if (existing.count > 0) return;

  console.log("🌱 Seeding default moods");
  const now = new Date().toISOString();

  for (const m of DEFAULT_MOODS) {
    await db.runAsync(
      `INSERT INTO moods (id, name, description, icon, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [m.id, m.name, m.description, m.icon, now]
    );
  }
};

export const saveMoods = async (db, moods) => {
  const now = new Date().toISOString();
  const query = `
    INSERT INTO moods (id, name, description, icon, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      icon = excluded.icon,
      updated_at = excluded.updated_at
  `;

  for (const m of moods) {
    await db.runAsync(query, [m.id, m.name, m.description ?? "", m.icon ?? null, now]);
  }

  console.log("💾 Moods cached locally");
};

export const getLocalMoods = async (db) => {
  return db.getAllAsync(`SELECT * FROM moods ORDER BY id DESC`);
};
