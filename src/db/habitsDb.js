import { db } from './database';

export const createHabit = (
  uuid,
  title,
  description,
  frequency,
  reminderTime,
  color,
  icon,
  priority = 0
) => {
  const now = new Date().toISOString();

  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO habits
        (uuid, title, description, frequency, reminder_time, color, icon, priority, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        uuid,
        title,
        description,
        frequency,
        reminderTime,
        color,
        icon,
        priority,
        now,
        now,
      ],
      () => console.log('✅ Habit saved locally'),
      (_, err) => {
        console.error('❌ Failed to save habit:', err);
        return true;
      }
    );
  });
};

export const getHabits = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM habits
       WHERE deleted = 0 AND is_active = 1
       ORDER BY priority DESC, created_at DESC`,
      [],
      (_, result) => callback(result.rows._array),
      (_, err) => {
        console.error('❌ Failed to fetch habits:', err);
        return true;
      }
    );
  });
};

export const updateHabit = (uuid, updates) => {
  const fields = [];
  const values = [];

  Object.keys(updates).forEach(key => {
    fields.push(`${key} = ?`);
    values.push(updates[key]);
  });

  values.push(uuid);

  db.transaction(tx => {
    tx.executeSql(
      `UPDATE habits 
       SET ${fields.join(', ')}, updated_at = ?, synced = 0
       WHERE uuid = ?`,
      [...values.slice(0, -1), new Date().toISOString(), uuid],
      () => console.log('✅ Habit updated'),
      (_, err) => {
        console.error('❌ Failed to update habit:', err);
        return true;
      }
    );
  });
};


export const deleteHabit = (uuid) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE habits 
       SET deleted = 1, synced = 0
       WHERE uuid = ?`,
      [uuid]
    );
  });
};


export const toggleHabitEntry = (uuid, habitUuid, date, completed, note = '') => {
  const now = new Date().toISOString();

  db.transaction(tx => {
    tx.executeSql(
      `INSERT OR REPLACE INTO habit_entries
        (uuid, habit_uuid, date, completed, note, created_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [uuid, habitUuid, date, completed ? 1 : 0, note, now],
      () => console.log('✅ Habit entry saved'),
      (_, err) => {
        console.error('❌ Failed to save habit entry:', err);
        return true;
      }
    );
  });
};


export const getHabitEntries = (habitUuid, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM habit_entries
       WHERE habit_uuid = ? AND deleted = 0
       ORDER BY date DESC`,
      [habitUuid],
      (_, result) => callback(result.rows._array),
      (_, err) => {
        console.error('❌ Failed to fetch habit entries:', err);
        return true;
      }
    );
  });
};

export const markHabitEntrySynced = (uuid) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE habit_entries SET synced = 1 WHERE uuid = ?`,
      [uuid]
    );
  });
};


