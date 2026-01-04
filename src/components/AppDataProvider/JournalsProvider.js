import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSQLiteContext } from 'expo-sqlite';
import { syncJournalsFromApi, markJournalSynced, getUnsyncedJournals, saveMoods, seedMoodsIfNeeded } from '../../db/journalsDb';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../../../api';
import { syncManager } from '../../../utils/syncManager'

export default function JournalsProvider({ children }) {
    const db = useSQLiteContext(); // ✅ Use SQLiteProvider's singleton DB
    const initialized = useRef(false);
    const userDetails = useSelector((state) => state?.user?.userDetails);
    const isUserLoggedIn = !!userDetails;

    const fetchJournals = async () => {
        let journals = [];
        try {
            const res = await api.get(`/journal/`);
            journals = res.data.results;
        } catch (err) {
            console.error("Journal fetch error:", err);
        } finally {
            return journals;
        }
    };

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

            const url = form.id ? `/journal/${form.id}/` : "/journal/";
            const method = form.id ? "PUT" : "POST";

            await api({
                url,
                method,
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
            });

            await markJournalSynced(db, form.uuid); // Pass db to local DB functions
        } catch (err) {
            console.error(err?.response?.data, "hello err debug");
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
            await saveMoods(db, res.data); // Pass db
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
                await seedMoodsIfNeeded(db); // Pass db

                await syncMoods();

                if (!isUserLoggedIn) return;

                console.log("📤 Syncing local journals to server...");
                const unsynced = await getUnsyncedJournals(db); // Pass db
                if (unsynced.length > 0) {
                    await syncJournalsToApi(unsynced);
                }

                console.log("📥 Syncing journals from server...");
                const remote = await fetchJournals();
                await syncJournalsFromApi(db, remote); // Pass db
                syncManager.emit("journals_updated");
                console.log("✅ Sync complete");
            } catch (e) {
                console.error("❌ JournalsProvider error:", e);
            } finally {
                syncing.current = false;
            }
        };

        const init = async () => {
            const state = await NetInfo.fetch();
            if (state.isConnected) {
                await bootstrap();
            } else {
                console.log("📴 Offline — waiting for connection");
            }

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
    }, [isUserLoggedIn, db]);

    return children;
}
