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

  // Convert string to Date if necessary
  if (!(serverTime instanceof Date)) {
    serverTime = new Date(serverTime)
  }

  if (isNaN(serverTime.getTime())) {
    console.warn("Invalid serverTime:", serverTime)
    return
  }

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

  console.log("✅ [journals] Last synced at saved:", value)
}

