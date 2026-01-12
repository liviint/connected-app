import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../../../api';
import { useSQLiteContext } from 'expo-sqlite';
import {
    getUnsyncedHabits,
    upsertHabitToApi,
    syncHabitsFromApi,
    getUnsyncedHabitEntries,
    syncHabitEntriesFromApi,
    syncHabitEntriesToApi,
    getHabitEntries,
} from '../../db/habitsDb';
import { v4 as uuidv4 } from 'react-native-uuid';
import { syncManager } from '../../../utils/syncManager'
import { AppState } from 'react-native';

// Helper to ensure database-safe values (prevents NullPointerException)
const sanitizeHabit = (habit) => ({
    id: habit.id ?? 0,
    uuid: habit.uuid || "",
    title: habit.title || "Untitled",
    description: habit.description ?? null,
    frequency: habit.frequency ?? null,
    reminder_time: habit.reminder_time ?? null,
    color: habit.color ?? null,
    icon: habit.icon ?? null,
    priority: habit.priority ?? 0,
    is_active: habit.is_active ?? 1,
    updated_at: habit.updated_at || new Date().toISOString(),
    deleted: habit.deleted ? 1 : 0,
});

export default function HabitsProvider({ children }) {
    const db = useSQLiteContext(); 
    const lastSyncTime = useRef(0);
    const syncing = useRef(false);
    const userDetails = useSelector((state) => state?.user?.userDetails);
    const isUserLoggedIn = !!userDetails;
    const appState = useRef(AppState.currentState)

    const fetchHabits = async () => {
        try {
            const res = await api.get('/habits/');
            return res.data?.results || [];
        } catch (e) {
            console.error('Habit fetch error:', e);
            return [];
        }
    };

    const fetchHabitEntries = async () => {
        try {
            const res = await api.get('habits/entries/');
            return res.data|| [];
        } catch (e) {
            console.error('Habit entries fetch error:', e);
            return [];
        }
    };

    const bootstrap = async () => {
        if (syncing.current) return;
        syncing.current = true;

        try {
            if (!isUserLoggedIn) return;

            console.log('📤 Syncing local habits to server...');
            const unsynced = await getUnsyncedHabits(db); 
            for (const habit of unsynced) {
                await upsertHabitToApi(db,habit);
            }

            console.log('📥 Syncing habits from server to local...');
            const remote = await fetchHabits();
            if (remote && Array.isArray(remote)) {
                const sanitizedRemote = remote.map(sanitizeHabit);
                await syncHabitsFromApi(db, sanitizedRemote); // Pass DB
            }

            console.log('✅ Habits sync complete');

            console.log('📤 Syncing local habit entries...');
            const localEntries = await getUnsyncedHabitEntries(db)
            for (const entry of localEntries) {
                await syncHabitEntriesToApi(db,entry);
            }

            console.log('📥 Syncing habit entries from server...');
            const apiEntries = await fetchHabitEntries()
            console.log(apiEntries,"hello api entries")
            await syncHabitEntriesFromApi(db, apiEntries,uuidv4);
            syncManager.emit("habits_updated");
        } catch (e) {
            console.error('❌ HabitsProvider bootstrap error:', e);
        } finally {
            syncing.current = false;
        }
    };

    useEffect(() => {

        let unsubscribeNetInfo;

        const init = async () => {
            const state = await NetInfo.fetch();
            if (state.isConnected) {
                await bootstrap();
            }

            unsubscribeNetInfo = NetInfo.addEventListener((state) => {
                if (state.isConnected) {
                    console.log('🌐 Back online — syncing habits');
                    bootstrap();
                }
            });
        };

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
