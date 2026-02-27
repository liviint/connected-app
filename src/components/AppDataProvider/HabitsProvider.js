import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";
import { api } from "../../../api";
import { syncManager } from "../../../utils/syncManager";
import { useSyncEngine } from "../../../src/hooks/useSyncEngine";
import {
    getUnsyncedHabits,
    syncHabitsFromApi,
    getUnsyncedHabitEntries,
    syncHabitEntriesFromApi,
    deleteSyncedHabits,
} from "../../db/habitsDb";
import { getLastSyncedAt, saveLastSyncedAt } from "../../db/common";

export default function HabitsProvider({ children }) {
    const db = useSQLiteContext();
    const userDetails = useSelector((state) => state?.user?.userDetails);
    const isSyncEnabled = !!userDetails;

    const syncHabitsFromLocalToApi = async () => {
        const unsynced = await getUnsyncedHabits(db);
        if (unsynced.length > 0) {
          await api.post("/habits/bulk_sync/", {
              items: unsynced,
          });
        }
    };

  const syncHabitsFromApiToLocal = async () => {
    const lastSyncedAt = await getLastSyncedAt(db, "habits");

    const res = await api.post("/habits/sync/", {
      last_synced_at: lastSyncedAt,
    });
    await syncHabitsFromApi(db, res.data.results);
    await saveLastSyncedAt(db, "habits", res.data.server_time );
  };

  const deletedHabits = async() => {
    try {
      await deleteSyncedHabits(db)
    } catch (error) {
      console.log(error)
    }
  }

  const syncEntriesFromLocalToApi = async () => {
    const unsynced = await getUnsyncedHabitEntries(db);
    if (unsynced.length > 0) {
      await api.post("/habits/entries/bulk_sync/", {
        items: unsynced,
      });
    }
  };

  const syncEntriesFromApiToLocal = async () => {
    const lastSyncedAt = await getLastSyncedAt(db, "habit_entries");

    const res = await api.post("/habits/entries/sync/", {
      last_synced_at: lastSyncedAt,
    });

    await syncHabitEntriesFromApi(db, res.data.results);
    await saveLastSyncedAt(db, "habit_entries", res.data.server_time);
  };

  const bootstrap = async () => {
    if(!isSyncEnabled) return
    await syncHabitsFromLocalToApi();
    await syncHabitsFromApiToLocal();
    await deletedHabits()
    syncManager.emit("habits_updated");

    await syncEntriesFromLocalToApi();
    await syncEntriesFromApiToLocal();
    syncManager.emit("habit_entries_updated");
  };

  useSyncEngine({
    name: "habits",
    bootstrap,
  });

  return children;
}
