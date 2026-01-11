import { shouldHaveEntry , calcStreak} from "./habitEntriesCalc";
import { v4 as uuidv4 } from 'react-native-uuid';
import { api } from "@/api";


export const upsertHabitToApi = async (db,habit) => {
    try {
      const payload = {
          uuid: habit.uuid,
          title: habit.title,
          frequency: habit.frequency,
          updated_at: habit.updated_at,
          deleted: habit.deleted,
          description:habit.description,
      };

      const url = habit.id && habit.id !== 0 ? `/habits/${habit.id}/` : '/habits/';
      const method = habit.id && habit.id !== 0 ? 'PUT' : 'POST';

      const res = await api({ url, method, data: payload });

      if (res.status === 200 || res.status === 201) {
          console.log(res.data,"hello res data")
          await markHabitSynced(db, habit.uuid,res.data.id); 
      }
  } catch (e) {
      console.error( e?.response?.data || e.message,'hello Habit sync error:');
  }
};

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
  isUserLoggedIn,
}) => {

  try {
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
  isUserLoggedIn && upsertHabitToApi(db,{id,uuid, title, description, frequency, reminder_time, color, icon, priority,updated_at:now})
  } catch (error) {
    console.log(error,"hello upserting habit locally error")
  }
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

export const markHabitSynced = async (db, uuid, serverId) => {
  await db.runAsync(
    `
    UPDATE habits
    SET
      synced = 1,
      id = ?
    WHERE uuid = ?
    `,
    [serverId, uuid]
  );
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

    // 1️⃣ Check for existing habit
    const existing = await db.getFirstAsync(
      `SELECT synced FROM habits WHERE uuid = ?`,
      [habit.uuid]
    );

    if (existing) {
      // 2️⃣ Update only if synced == 1 (local unsynced edits are preserved)
      if (existing.synced === 1) {
        await db.runAsync(
          `
          UPDATE habits
          SET
            id = ?,
            user_uuid = ?,
            title = ?,
            description = ?,
            frequency = ?,
            reminder_time = ?,
            color = ?,
            icon = ?,
            next_due_date = ?,
            priority = ?,
            is_active = ?,
            created_at = ?,
            updated_at = ?,
            synced = 1,
            deleted = 0
          WHERE uuid = ?
          `,
          [
            habit.id,
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
            habit.uuid,
          ]
        );
      }
    } else {
      // 3️⃣ Insert new habit if missing locally
      await db.runAsync(
        `
        INSERT INTO habits (
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
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
  if (!habitUuid) {
    return db.getAllAsync(
      `
      SELECT *
      FROM habit_entries
      WHERE deleted = 0
      ORDER BY date DESC
      `
    );
  }

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


export const markHabitEntrySynced = async (db, uuid, serverId) => {
  await db.runAsync(
    `
    UPDATE habit_entries
    SET
      synced = 1,
      id = ?
    WHERE uuid = ?
    `,
    [serverId, uuid]
  );
};

export async function getHabitsForToday(db,uuid) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // 1️⃣ Get active habits
  const habits = await db.getAllAsync(
    `SELECT * FROM habits WHERE is_active = 1 ORDER BY priority ASC`
  );

  // 2️⃣ Get today's entries
  const entriesToday = await db.getAllAsync(
    `SELECT * FROM habit_entries WHERE date = ? AND deleted = 0`,
    [todayStr]
  );

  // 3️⃣ Get all completed entries (for streaks)
  const allEntries = await db.getAllAsync(
    `SELECT * FROM habit_entries WHERE completed = 1 AND deleted = 0`
  );

  // 4️⃣ Build annotated response
  return habits.map((habit) => {

    const entry = entriesToday.find(
      (e) => e.habit_uuid === habit.uuid
    );

    const habitEntries = allEntries.filter(
      (e) => e.habit_uuid === habit.uuid
    );

    const streaks = calcStreak(habit, habitEntries);

    return {
      habit_uuid: habit.uuid,
      habit_id: habit.id,
      title: habit.title,
      description: habit.description,
      frequency: habit.frequency,
      priority: habit.priority,
      uuid:entry?.uuid || uuid.v4(),

      id: entry?.id || 0,
      completed: entry ? entry.completed === 1 : false,
      canToggle: shouldHaveEntry(habit, today),

      current_streak: streaks.current,
      longest_streak: streaks.longest,
    };
  });
}

export async function toggleHabitEntry(
  db,
  {
    habit_uuid,
    habit_id,
    date = null,
    uuid,
    isUserLoggedIn,
    completed
  }
) {

  try {
  const targetDate =
    date ?? new Date().toISOString().slice(0, 10);

  // 1️⃣ Check if entry exists for this habit + date
  const entry = await db.getFirstAsync(
    `
    SELECT * FROM habit_entries
    WHERE habit_uuid = ? AND date = ? AND deleted = 0
    LIMIT 1
    `,
    [habit_uuid, targetDate]
  );

  if (entry) {
    // 2️⃣ Toggle existing entry
    await db.runAsync(
      `
      UPDATE habit_entries
      SET completed = ?, synced = 0
      WHERE uuid = ?
      `,
      [completed ? 1 : 0, entry.uuid]
    );
  } else {
    // 3️⃣ Create entry if missing (only when user explicitly toggles)
    await db.runAsync(
      `
      INSERT INTO habit_entries (
        uuid,
        habit_uuid,
        date,
        completed,
        habit_id,
        synced,
        deleted
      )
      VALUES (?, ?, ?, ?, ?, 0, 0)
      `,
      [
        uuid,
        habit_uuid,
        targetDate,
        1,
        habit_id
      ]
    );
  }
  isUserLoggedIn && toggleHabitEntryToApi(db,{...entry,habit_uuid,habit_id,date,uuid,completed})
  } catch (error) {
    console.log(error,"hello toggle issue")
  }
  
}

export const toggleHabitEntryToApi = async (db, entry) => {
  const habit = await getHabits(db, entry.habit_uuid);

  try {
    const res = await api.put("/habits/entries/toggle/", {
      habit_id: habit.id,
      uuid: entry.uuid,
      updated_at: entry.updated_at, 
      completed:entry.completed
    });

    // ✅ Server accepted change
    const serverEntry = res.data;  

    await db.runAsync(
      `
      UPDATE habit_entries
      SET
        completed = ?,
        synced = 1,
        id = ?,
        updated_at = ?
      WHERE uuid = ?
      `,
      [
        serverEntry.completed ? 1 : 0,
        serverEntry.id,
        serverEntry.updated_at,
        entry.uuid,
      ]
    );

  } catch (e) {
    // ⚠️ Conflict detected
    if (e?.response?.status === 409) {
      const serverEntry = e.response.data.server_entry;

      // ✅ Server is newer → overwrite local
      await db.runAsync(
        `
        UPDATE habit_entries
        SET
          completed = ?,
          synced = 1,
          id = ?,
          updated_at = ?
        WHERE uuid = ?
        `,
        [
          serverEntry.completed ? 1 : 0,
          serverEntry.id,
          serverEntry.updated_at,
          entry.uuid,
        ]
      );
    } else {
      console.error(
        "Habit entry sync error:",
        e?.response?.data || e.message
      );
    }
  }
};

export const syncHabitEntriesToApi = async (db, entry) => {
  const habit = await getHabits(db, entry.habit_uuid);

  try {
    const res = await api.put("/habits/entries/sync/", {
      habit_id: habit.id,
      uuid: entry.uuid,
      date: entry.date,              
      completed: !!entry.completed,
      updated_at: entry.updated_at,
    });

    // ✅ Server accepted change
    const serverEntry = res.data;  

    await db.runAsync(
      `
      UPDATE habit_entries
      SET
        completed = ?,
        synced = 1,
        id = ?,
        updated_at = ?
      WHERE uuid = ?
      `,
      [
        serverEntry.completed ? 1 : 0,
        serverEntry.id,
        serverEntry.updated_at,
        entry.uuid,
      ]
    );

  } catch (e) {
    // ⚠️ Conflict detected
    if (e?.response?.status === 409) {
      const serverEntry = e.response.data.server_entry;

      // ✅ Server is newer → overwrite local
      await db.runAsync(
        `
        UPDATE habit_entries
        SET
          completed = ?,
          synced = 1,
          id = ?,
          updated_at = ?
        WHERE uuid = ?
        `,
        [
          serverEntry.completed ? 1 : 0,
          serverEntry.id,
          serverEntry.updated_at,
          entry.uuid,
        ]
      );
    } else {
      console.error(
        "Habit entry sync error:",
        e?.response?.data || e.message
      );
    }
  }
};



export async function syncHabitEntriesFromApi(db, entries) {
  await db.execAsync('BEGIN TRANSACTION');
  console.log(entries,"hello entries")
  try {
    for (const item of entries) {
      const {
        habit_uuid,
        uuid,
        completed,
        id: serverId,
        date,
        updated_at: serverUpdatedAt,
      } = item;

      if (!habit_uuid || !date || !uuid) continue;
      if(item.title === "Hello 2") console.log(item,"hello server entry")

      const localEntry = await db.getFirstAsync(
        `
        SELECT uuid, updated_at
        FROM habit_entries
        WHERE uuid = ? AND deleted = 0
        `,
        [uuid]
      );

      if (localEntry) {
        // ✅ Only update local if server is newer
        if (
          !localEntry.updated_at ||
          new Date(serverUpdatedAt) > new Date(localEntry.updated_at)
        ) {
          await db.runAsync(
            `
            UPDATE habit_entries
            SET
              completed = ?,
              id = ?,
              synced = 1,
              deleted = 0,
              updated_at = ?
            WHERE uuid = ?
            `,
            [
              completed ? 1 : 0,
              serverId,
              serverUpdatedAt,
              uuid,
            ]
          );
        }
      } else {
        // ✅ Insert missing entry
        await db.runAsync(
          `
          INSERT INTO habit_entries (
            uuid,
            id,
            habit_uuid,
            date,
            completed,
            synced,
            deleted,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, 1, 0, ?)
          `,
          [
            uuid,
            serverId,
            habit_uuid,
            date,
            completed ? 1 : 0,
            serverUpdatedAt,
          ]
        );
      }
    }

    await db.execAsync("COMMIT");
  } catch (e) {
    await db.execAsync("ROLLBACK");
    console.log(e, "hello error entries sync");
  }
}



export async function getUnsyncedHabitEntries(db) {
  return db.getAllAsync(`
    SELECT * FROM habit_entries
    WHERE synced = 0 AND deleted = 0
  `);
}






