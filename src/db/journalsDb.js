import { DEFAULT_MOODS } from "../../utils/defaultMoods";
import { api } from "@/api";
import uuid from "react-native-uuid";
import { getPeriodDateFilter } from "./periodFilter";

const newUuid = () => uuid.v4();

export const syncJournalToApi = async (db, journal) => {
  try {
    const res = await api.put("/journal/sync/", {
      uuid: journal.uuid,
      title: journal.title,
      content: journal.content,
      mood: journal.mood_id,
      updated_at: journal.updated_at,
    });

    const serverEntry = res.data;

    // ✅ Server accepted client version
    await db.runAsync(
      `
      UPDATE journal_entries
      SET
        id = ?,
        title = ?,
        content = ?,
        transcript = ?,
        synced = 1,
        updated_at = ?
      WHERE uuid = ?
      `,
      [
        serverEntry.id,
        serverEntry.title,
        serverEntry.content,
        serverEntry.transcript,
        serverEntry.updated_at,
        journal.uuid,
      ]
    );
  } catch (e) {
    // ⚠️ CONFLICT
    if (e?.response?.status === 409) {
      const serverEntry = e.response.data.server_entry;

      // ✅ Overwrite local with server version
      await db.runAsync(
        `
        UPDATE journal_entries
        SET
          id = ?,
          title = ?,
          content = ?,
          transcript = ?,
          synced = 1,
          updated_at = ?
        WHERE uuid = ?
        `,
        [
          serverEntry.id,
          serverEntry.title,
          serverEntry.content,
          serverEntry.transcript,
          serverEntry.updated_at,
          journal.uuid,
        ]
      );
    } else {
      console.error(
        "Journal sync error:",
        e?.response?.data || e.message
      );
    }
  }
};


export const upsertJournal = async (db, { id, uuid, title, content, mood_uuid, mood_label, }) => {
  const now = new Date().toISOString();
  try {
    await db.runAsync(
      `
      INSERT INTO journal_entries (
        id,
        uuid,
        title,
        content,
        mood_uuid,
        mood_label,
        created_at,
        updated_at,
        synced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
      ON CONFLICT(uuid) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        mood_uuid = excluded.mood_uuid,
        mood_label = excluded.mood_label,
        updated_at = excluded.updated_at,
        synced = 0
      `,
      [id, uuid, title, content, mood_uuid, mood_label, now, now]
    );
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


export const getJournals = async (db, uuid = null, period = "30 days") => {
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


    const dateFilter = getPeriodDateFilter(period);

    const rows = await db.getAllAsync(
      `
      SELECT * FROM journal_entries
      WHERE deleted = 0
      ${dateFilter}
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
export const markJournalSynced = async (db, uuid, serverEntry) => {
  try {
    await db.runAsync(
      `
      UPDATE journal_entries
      SET
        id = ?,
        synced = 1,
        updated_at = ?
      WHERE uuid = ?
      `,
      [
        serverEntry.id,
        serverEntry.updated_at,
        uuid,
      ]
    );

    console.log("✅ Journal marked as synced", serverEntry.id);
  } catch (error) {
    console.error("❌ Failed to mark journal as synced:", error);
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
        mood_uuid,
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
        journal.mood_uuid || null,
        journal.mood_label || null,
        journal.created_at,
        journal.updated_at,
      ]
    );
  }
};

export const getUnsyncedMoods = async (db) => {
  return db.getAllAsync(`
    SELECT *
    FROM moods
    WHERE synced =  0
  `);
};


export const syncDeletedJournalsToApi = async (db) => {
  const deleted = await db.getAllAsync(
    `
    SELECT uuid, id, updated_at
    FROM journal_entries
    WHERE deleted = 1 AND synced = 0
    `
  );

  for (const journal of deleted) {
    try {
      const url = journal.id
        ? `/journal/${journal.id}/`
        : `/journal/by-uuid/${journal.uuid}/`;

      await api.delete(url);

      // ✅ Mark as synced delete
      await db.runAsync(
        `
        UPDATE journal_entries
        SET synced = 1
        WHERE uuid = ?
        `,
        [journal.uuid]
      );
    } catch (e) {
      console.error("❌ Failed to delete journal on server", e?.response?.data);
    }
  }
};

export const syncJournalDeletesFromApi = async (db, serverJournals) => {
  for (const journal of serverJournals) {
    if (!journal.deleted) continue;

    await db.runAsync(
      `
      DELETE FROM journal_entries
      WHERE uuid = ?
      `,
      [journal.uuid]
    );
  }
};

export const seedMoodsIfNeeded = async (db) => {
  const existing = await db.getFirstAsync(`SELECT COUNT(*) as count FROM moods`);
  if (existing.count > 0) return;
  const now = new Date().toISOString();

  for (const m of DEFAULT_MOODS) {
    const moodUuid = newUuid(); 
    await db.runAsync(
      `INSERT INTO moods (
        uuid, id, name, description, icon, updated_at, deleted_at, synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        moodUuid,
        m.id || null,
        m.name,
        m.description ?? "",
        m.icon ?? null,
        now,
        null, 
        0     
      ]
    );
  }
};


export const saveMoods = async (db, moods) => {
  const now = new Date().toISOString();

  const query = `
    INSERT INTO moods (
      uuid, name, description, icon, updated_at, deleted_at, synced
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(uuid) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      icon = excluded.icon,
      updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at,
      synced = excluded.synced
  `;

  for (const m of moods) {
    const moodUuid = m.uuid || newUuid();
    await db.runAsync(query, [
      moodUuid,
      m.name,
      m.description ?? "",
      m.icon ?? null,
      now,
      m.deleted_at ?? null,
      1 // mark as synced
    ]);
  }

  console.log("💾 Moods cached locally");
};


export const getLocalMoods = async (db) => {
  return db.getAllAsync(`SELECT * FROM moods ORDER BY id DESC`);
};

export const purgeSyncedDeletes = async (db) => {
  await db.execAsync("BEGIN TRANSACTION");
  try {
    await db.runAsync(`
      DELETE FROM journal_entries
      WHERE deleted = 1 AND synced = 1
    `);

    await db.runAsync(`
      DELETE FROM habit_entries
      WHERE deleted = 1 AND synced = 1
    `);

    await db.runAsync(`
      DELETE FROM habits
      WHERE deleted = 1 AND synced = 1
    `);

    await db.execAsync("COMMIT");
    console.log("🧹 Purged synced deletes");
  } catch (e) {
    await db.execAsync("ROLLBACK");
    console.error("❌ Purge failed", e);
  }
};



