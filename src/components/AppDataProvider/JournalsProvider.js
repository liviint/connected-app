import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSQLiteContext } from 'expo-sqlite';
import { syncJournalsFromApi, getUnsyncedJournals, saveMoods, seedMoodsIfNeeded, upsertJournalsToApi } from '../../db/journalsDb';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../../../api';
import { syncManager } from '../../../utils/syncManager'
import { AppState } from 'react-native';

export default function JournalsProvider({ children }) {
    const db = useSQLiteContext(); 
    const lastSyncTime = useRef(0);
    const userDetails = useSelector((state) => state?.user?.userDetails);
    const isUserLoggedIn = !!userDetails;
    const appState = useRef(AppState.currentState)

    const fetchJournals = async () => {
        let journals = [];
        try {
            const res = await api.get(`/journal/?all=true`);
            journals = res.data
        } catch (err) {
            console.error("Journal fetch error:", err);
        } finally {
            return journals;
        }
    };


    const syncJournalsToApi = async (journals) => {
        for (const journal of journals) {
            await upsertJournalsToApi(db,journal);
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
                    const now = Date.now();
                    if (now - lastSyncTime.current > 5000) {
                        console.log("🌐 Back online — triggering sync");
                        bootstrap();
                        lastSyncTime.current = now;
                    }
                }
            });
        }

        init();

        const handleAppStateChange = (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === "active") {
                const now = Date.now();
                if (now - lastSyncTime.current > 5000) {
                    console.log("🔄 App came to foreground — triggering sync");
                    bootstrap();
                    lastSyncTime.current = now;
                }
            }
            appState.current = nextAppState;
        };
        const appStateListener = AppState.addEventListener("change",handleAppStateChange);

        return () => {
            if (unsubscribeNetInfo) unsubscribeNetInfo();
            appStateListener.remove();
        };
    }, [isUserLoggedIn, db]);

    return children;
}
