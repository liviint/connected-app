import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { initDatabase } from '../../db/database';
import { syncJournalsFromApi, markJournalSynced, getUnsyncedJournals, saveMoods, seedMoodsIfNeeded  } from '../../db/journalsDb';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../../../api';

export default function AppDataProvider({ children }) {
    const initialized = useRef(false);
    const isUserLoggedIn = useSelector((state) => state?.user?.userDetails);
    const fetchJournals =  async () => {
        let journals = []
        try {
            const res = await api.get(`/journal/`);
            journals = res.data.results
        } catch (err) {
            console.error("Journal fetch error:", err);
        } finally{
            return journals
        }   
    }

    const upsertJournalsToApi = async (form) => {
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("content", form.content);
            formData.append("mood_id", form.mood_id);
            formData.append("uuid", form.uuid);
            formData.append("updated_at", form.updated_at);

            if (form.audioUri && !form.audioUri.startsWith("http")) {
                const uriParts = form.audioUri.split("/");
                const name = uriParts[uriParts.length - 1];
                formData.append("audio_file", { uri: form.audioUri, name, type: "audio/mpeg" });
            }

            // 3️⃣ Send to API
            const url = form.id ? `/journal/${form.id}/` : "/journal/";
            const method = form.id ? "PUT" : "POST";

            await api({
                url,
                method,
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
            });

            // 4️⃣ Mark local journal as synced
            await markJournalSynced(form.uuid);
        } catch (err) {
            console.error(err?.response,"hello err");
        } 
    };

    const syncJournalsToApi = async (journals) => {
        for (const journal of journals) {
            await upsertJournalsToApi(journal); 
        }
    };

    const syncMoods = async () => {
        try {
            const res = await api.get("journal/categories/");
            await saveMoods(res.data);
            console.log("🔄 Moods synced");
        } catch {
            console.log("📴 Offline — using cached moods");
        }
    };


    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        let unsubscribeNetInfo;
        const syncing = { current: false };

        const bootstrap = async () => {
            if (syncing.current) return;
            syncing.current = true;

            try {
            console.log("📦 Initializing local database...");
            await initDatabase();

            // 🌱 Always available offline
            await seedMoodsIfNeeded();

            // 🌐 Try syncing moods if online
            await syncMoods();

            if (!isUserLoggedIn) return;

            console.log("📤 Syncing local journals to server...");
            const unsynced = await getUnsyncedJournals();
            if (unsynced.length > 0) {
                await syncJournalsToApi(unsynced);
            }

            console.log("📥 Syncing journals from server...");
            const remote = await fetchJournals();
            await syncJournalsFromApi(remote);

            console.log("✅ Sync complete");
            } catch (e) {
            console.error("❌ AppDataProvider error:", e);
            } finally {
            syncing.current = false;
            }
        };

        const init = async () => {
            // 🚀 Initial attempt
            const state = await NetInfo.fetch();
            if (state.isConnected) {
            await bootstrap();
            } else {
            console.log("📴 Offline — waiting for connection");
            }

            // 🔁 Re-sync on reconnect
            unsubscribeNetInfo = NetInfo.addEventListener((state) => {
            if (state.isConnected) {
                console.log("🌐 Back online — triggering sync");
                bootstrap();
            }
            });
        };

        init();

        return () => {
            if (unsubscribeNetInfo) unsubscribeNetInfo();
        };
    }, [isUserLoggedIn]);




    return children;
}

/* 
const clearAllData = async () => {
            const db = await getDatabase();

            await db.execAsync(`
                BEGIN TRANSACTION;

                DELETE FROM journal_entries;
                DELETE FROM habits;
                DELETE FROM habit_entries;

                COMMIT;
            `);

            console.log('✅ All local data cleared');
            };

        clearAllData()
*/
