import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../../../api';
import { initDatabase } from '../../db/database';
import {
    getUnsyncedHabits,
    markHabitSynced,
    syncHabitsFromApi,
} from '../../db/habitsDb';

// Helper to ensure database-safe values (Prevents NullPointerException)
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

    const upsertHabitToApi = async (habit) => {
        try {
            // Only send what the API expects
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
                await markHabitSynced(habit.uuid);
                // If the API returns a new ID, you might want to update local DB here
            }
        } catch (e) {
            console.error('Habit sync error:', e?.response?.data || e.message);
        }
    };

    const bootstrap = async () => {
        if (syncing.current) return;
        syncing.current = true;

        try {
            await initDatabase();

            if (!isUserLoggedIn) {
                syncing.current = false;
                return;
            }

            console.log('📤 Syncing local habits to server...');
            const unsynced = await getUnsyncedHabits();
            for (const habit of unsynced) {
                await upsertHabitToApi(habit);
            }

            console.log('📥 Syncing habits from server to local...');
            const remote = await fetchHabits();
            
            if (remote && Array.isArray(remote)) {
                // Sanitize all incoming habits before saving to DB
                const sanitizedRemote = remote.map(sanitizeHabit);
                await syncHabitsFromApi(sanitizedRemote);
            }

            console.log('✅ Habits sync complete');
        } catch (e) {
            console.error('❌ HabitsProvider bootstrap error:', e);
        } finally {
            syncing.current = false;
        }
    };

    useEffect(() => {
        // Prevent double-initialization on mount
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
            initialized.current = false; // Reset on unmount
        };
    }, [isUserLoggedIn]); // Re-run bootstrap if user login status changes

    return children;
}