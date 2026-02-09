export async function getLastSyncedAt(db, type) {
  const key = `last_synced_at:${type}`;

  const row = await db.getFirstAsync(
    `SELECT value FROM app_settings WHERE key = ? LIMIT 1`,
    [key]
  );

  if (!row?.value) {
    return null;
  }

  return new Date(row.value);
}

export async function saveLastSyncedAt(db, type, serverTime) {
  const key = `last_synced_at:${type}`;

  if(!(serverTime instanceof Date)) return

  const value = serverTime.toISOString()

  await db.runAsync(
    `
    INSERT INTO app_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value
    `,
    [key, value]
  );
}
