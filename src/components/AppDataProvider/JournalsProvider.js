import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";
import { api } from "../../../api";
import { syncManager } from "../../../utils/syncManager";
import { useSyncEngine } from "../../../src/hooks/useSyncEngine";

import {
  syncJournalsFromApi,
  getUnsyncedJournals,
  getUnsyncedMoods,
  syncJournalToApi,
  saveMoods,
  seedMoodsIfNeeded,
} from "../../db/journalsDb";

import { getLastSyncedAt, saveLastSyncedAt } from "../../db/common";

export default function JournalsProvider({ children }) {
    const db = useSQLiteContext();
    const userDetails = useSelector((state) => state?.user?.userDetails);
    const enabled = !!userDetails;


    const syncMoods = async () => {
        try {
        const res = await api.get("/journal/categories/");
        await saveMoods(db, res.data);
        } catch {
        }
    };

    const syncJournalsFromLocalToApi = async () => {
        const unsynced = await getUnsyncedJournals(db);
        console.log(unsynced,"hello unsynced")
        if (unsynced.length > 0) {
            await api.post("/journal/bulk_sync/", {
                items: unsynced,
            });
        }
    };

    const syncJournalsFromApiToLocal = async () => {
        const lastSyncedAt = await getLastSyncedAt(db, "journals");

        const res = await api.post("/journal/sync/", {
            last_synced_at: lastSyncedAt,
        });
        console.log(lastSyncedAt,res.data.results,res.data.server_time,"hello res 1")

        await syncJournalsFromApi(db, res.data.results);
        await saveLastSyncedAt(db, "journals" ,res.data.server_time, );
    };


    const seedMoodsToApi = async (db) => {
        const unsynced = await getUnsyncedMoods(db)
        console.log(unsynced,"hello unsynced")
        if (!unsynced.length) return;
        try {
            await api.post("/journal/categories/bulk_sync/", {
            items: unsynced,
            });
        } catch (e) {
            
        }
    };


    const bootstrap = async () => {
        await seedMoodsIfNeeded(db);
        await syncMoods();
        await seedMoodsToApi(db)

        await syncJournalsFromLocalToApi();
        await syncJournalsFromApiToLocal();

        syncManager.emit("journals_updated");
    };

    useSyncEngine({
        enabled,
        name: "journals",
        bootstrap,
    });

    return children;
}
