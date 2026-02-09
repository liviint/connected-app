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
} from "../../db/habitsDb";
import { getLastSyncedAt, saveLastSyncedAt } from "../../db/common";

export default function HabitsProvider({ children }) {
    const db = useSQLiteContext();
    const userDetails = useSelector((state) => state?.user?.userDetails);
    const enabled = !!userDetails;

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
    console.log(lastSyncedAt,res.data.results,"hello last synced at")
    await syncHabitsFromApi(db, res.data.results);
    await saveLastSyncedAt(db, "habits", res.data.server_time );
  };

  // -----------------------------
  // HABIT ENTRIES
  // -----------------------------
  const syncEntriesFromLocalToApi = async () => {
    const unsynced = await getUnsyncedHabitEntries(db);
    console.log(unsynced,"hello unsynced")
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

  // -----------------------------
  // BOOTSTRAP
  // -----------------------------
  const bootstrap = async () => {
    await syncHabitsFromLocalToApi();
    await syncHabitsFromApiToLocal();
    syncManager.emit("habits_updated");

    await syncEntriesFromLocalToApi();
    await syncEntriesFromApiToLocal();
    syncManager.emit("habit_entries_updated");
  };

  useSyncEngine({
    enabled,
    name: "habits",
    bootstrap,
  });

  return children;
}
