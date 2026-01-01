import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../../../api';
import { useSQLiteContext } from 'expo-sqlite';
import {
    getUnsyncedHabits,
    markHabitSynced,
    syncHabitsFromApi,
    getUnsyncedHabitEntries,
    syncHabitEntriesFromApi,
    getHabits
} from '../../db/habitsDb';

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
    const db = useSQLiteContext(); // ✅ Use singleton DB from SQLiteProvider
    const initialized = useRef(false);
    const syncing = useRef(false);

    const userDetails = useSelector((state) => state?.user?.userDetails);
    const isUserLoggedIn = !!userDetails;

    const fetchHabits = async () => {
        try {
            const res = await api.get('/habits/');
            return res.data?.results || [];
        } catch (e) {
            console.error('Habit fetch error:', e);
            return [];
        }
    };

    const fetchHabitEntries = async (date = 'today') => {
        try {
            const res = await api.get('habits/entries/entries/', {
            params: { date },
            });
            return res.data || [];
        } catch (e) {
            console.error('Habit entries fetch error:', e);
            return [];
        }
    };

    const toggleHabitEntryToApi = async (entry) => {
        let habit = await getHabits(db,entry.habit_uuid)
        console.log(entry,habit,"hello entry habit")
        try {
            await api.put('/habits/entries/toggle/', {
                habit_id: habit.id, 
                date: entry.date,
            });

            await db.runAsync(
            `UPDATE habit_entries SET synced = 1 WHERE uuid = ?`,
            [entry.uuid]
            );
        } catch (e) {
            console.error('Habit entry sync error:', e?.response?.data || e.message);
        }
    };


    const upsertHabitToApi = async (habit) => {
        try {
            const payload = {
                uuid: habit.uuid,
                title: habit.title,
                frequency: habit.frequency,
                updated_at: habit.updated_at,
                deleted: habit.deleted,
            };

            const url = habit.id && habit.id !== 0 ? `/habits/${habit.id}/` : '/habits/';
            const method = habit.id && habit.id !== 0 ? 'PUT' : 'POST';

            const res = await api({ url, method, data: payload });

            if (res.status === 200 || res.status === 201) {
                console.log(res.data,"hello res data")
                await markHabitSynced(db, habit.uuid,res.data.id); 
            }
        } catch (e) {
            console.error('Habit sync error:', e?.response?.data || e.message);
        }
    };

    const bootstrap = async () => {
        if (syncing.current) return;
        syncing.current = true;

        try {
            if (!isUserLoggedIn) return;

            console.log('📤 Syncing local habits to server...');
            const unsynced = await getUnsyncedHabits(db); // Pass DB
            for (const habit of unsynced) {
                await upsertHabitToApi(habit);
            }

            console.log('📥 Syncing habits from server to local...');
            const remote = await fetchHabits();
            if (remote && Array.isArray(remote)) {
                const sanitizedRemote = remote.map(sanitizeHabit);
                await syncHabitsFromApi(db, sanitizedRemote); // Pass DB
            }

            console.log('✅ Habits sync complete');

            console.log('📤 Syncing local habit entries...');
            const unsyncedEntries = await getUnsyncedHabitEntries(db);
            console.log(unsyncedEntries,"hello unsynced")
            for (const entry of unsyncedEntries) {
                await toggleHabitEntryToApi(entry);
            }

            console.log('📥 Syncing habit entries from server...');
            const todayEntries = await fetchHabitEntries('today');
            await syncHabitEntriesFromApi(db, todayEntries);

        } catch (e) {
            console.error('❌ HabitsProvider bootstrap error:', e);
        } finally {
            syncing.current = false;
        }
    };

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        let unsubscribe;

        const init = async () => {
            const state = await NetInfo.fetch();
            if (state.isConnected) {
                await bootstrap();
            }

            unsubscribe = NetInfo.addEventListener((state) => {
                if (state.isConnected) {
                    console.log('🌐 Back online — syncing habits');
                    bootstrap();
                }
            });
        };

        init();

        return () => {
            if (unsubscribe) unsubscribe();
            initialized.current = false;
        };
    }, [isUserLoggedIn, db]);

    return children;
}
