// habitsDb.js
// All DB functions now require a `db` parameter from useSQLiteContext()

export const upsertHabit = async (db, {
  id,
  uuid,
  title,
  description,
  frequency,
  reminder_time,
  color,
  icon,
  priority = 0,
  is_active = 1,
}) => {
  console.log(id, uuid, title, description, frequency, reminder_time, color, icon, priority, is_active, "hello id upsert");

  const now = new Date().toISOString();

  await db.runAsync(
    `
    INSERT INTO habits (
      id,
      uuid,
      title,
      description,
      frequency,
      reminder_time,
      color,
      icon,
      priority,
      is_active,
      created_at,
      updated_at,
      synced,
      deleted
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    ON CONFLICT(uuid) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      frequency = excluded.frequency,
      reminder_time = excluded.reminder_time,
      color = excluded.color,
      icon = excluded.icon,
      priority = excluded.priority,
      is_active = excluded.is_active,
      updated_at = excluded.updated_at,
      synced = 0
    `,
    [id, uuid, title, description, frequency, reminder_time, color, icon, priority, is_active, now, now]
  );
};

export const getHabits = async (db, uuid = null) => {
  if (uuid) {
    return db.getFirstAsync(
      `
      SELECT *
      FROM habits
      WHERE uuid = ?
        AND deleted = 0
        AND is_active = 1
      `,
      [uuid]
    );
  }

  return db.getAllAsync(
    `
    SELECT *
    FROM habits
    WHERE deleted = 0
      AND is_active = 1
    ORDER BY priority DESC, created_at DESC
    `
  );
};

export const getUnsyncedHabits = async (db) => {
  return db.getAllAsync(`SELECT * FROM habits WHERE synced = 0`);
};

export const markHabitSynced = async (db, uuid) => {
  await db.runAsync(`UPDATE habits SET synced = 1 WHERE uuid = ?`, [uuid]);
};

export const deleteHabit = async (db, uuid) => {
  const now = new Date().toISOString();
  await db.runAsync(
    `
    UPDATE habits
    SET deleted = 1,
        synced = 0,
        updated_at = ?
    WHERE uuid = ?
    `,
    [now, uuid]
  );
};

export const syncHabitsFromApi = async (db, habits) => {
  for (const habit of habits) {
    if (!habit.uuid) continue;

    const existing = await db.getFirstAsync(
      `SELECT synced FROM habits WHERE uuid = ?`,
      [habit.uuid]
    );

    if (existing && existing.synced === 0) continue; // Preserve unsynced local edits

    await db.runAsync(
      `
      INSERT OR REPLACE INTO habits (
        id,
        uuid,
        user_uuid,
        title,
        description,
        frequency,
        reminder_time,
        color,
        icon,
        next_due_date,
        priority,
        is_active,
        created_at,
        updated_at,
        synced,
        deleted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
      `,
      [
        habit.id,
        habit.uuid,
        habit.user,
        habit.title,
        habit.description,
        habit.frequency,
        habit.reminder_time,
        habit.color,
        habit.icon,
        habit.next_due_date,
        habit.priority,
        habit.is_active,
        habit.created_at,
        habit.updated_at,
      ]
    );
  }
};

export const upsertHabitEntry = async (db, { uuid, habit_uuid, date, completed, note = '' }) => {
  await db.runAsync(
    `
    INSERT INTO habit_entries (
      uuid,
      habit_uuid,
      date,
      completed,
      note,
      synced,
      deleted
    )
    VALUES (?, ?, ?, ?, ?, 0, 0)
    ON CONFLICT(habit_uuid, date) DO UPDATE SET
      completed = excluded.completed,
      note = excluded.note,
      synced = 0
    `,
    [uuid, habit_uuid, date, completed ? 1 : 0, note]
  );
};

export const getHabitEntries = async (db, habitUuid) => {
  return db.getAllAsync(
    `
    SELECT *
    FROM habit_entries
    WHERE habit_uuid = ? AND deleted = 0
    ORDER BY date DESC
    `,
    [habitUuid]
  );
};

export const markHabitEntrySynced = async (db, uuid) => {
  await db.runAsync(`UPDATE habit_entries SET synced = 1 WHERE uuid = ?`, [uuid]);
};
