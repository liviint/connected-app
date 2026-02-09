export const addMoodsSyncColumnsIfNeeded = async (db) => {
  const columns = await db.getAllAsync(`PRAGMA table_info(moods);`);

  const hasDeletedAt = columns.some(col => col.name === "deleted_at");
  const hasSynced = columns.some(col => col.name === "synced");
  const hasUuid = columns.some(col => col.name === "uuid");

  if (!hasDeletedAt) {
    await db.runAsync(`
      ALTER TABLE moods
      ADD COLUMN deleted_at TEXT
    `);
  }

  if (!hasSynced) {
    await db.runAsync(`
      ALTER TABLE moods
      ADD COLUMN synced INTEGER DEFAULT 0
    `);
  }

  if (!hasUuid) {
    await db.runAsync(`
        ALTER TABLE moods
        ADD COLUMN uuid TEXT
    `);
  }
};

export const extraMigrations = (db) => {
    addMoodsSyncColumnsIfNeeded(db)
}