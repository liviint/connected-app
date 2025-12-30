import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../../../api';
import { initDatabase, getDatabase } from '../../db/database';
import {
    getUnsyncedHabits,
    markHabitSynced,
    syncHabitsFromApi,
    upsertHabit,
} from '../../db/habitsDb';

export default function HabitsProvider({ children }) {
  const initialized = useRef(false);
  const syncing = useRef(false);

  const isUserLoggedIn = useSelector(
    (state) => state?.user?.userDetails
  );

  const fetchHabits = async () => {
    try {
      const res = await api.get('/habits/');
      return res.data.results;
    } catch (e) {
      console.error('Habit fetch error:', e);
      return [];
    }
  };

  const upsertHabitToApi = async (habit) => {
    console.log(habit,"hello unsynced habit")
    try {
      const payload = {
        uuid: habit.uuid,
        title: habit.title,
        frequency: habit.frequency,
        updated_at: habit.updated_at,
        deleted: habit.deleted,
      };
      console.log(habit.id,"hello habit id syncing")
      const url = habit.id
        ? `/habits/${habit.id}/`
        : '/habits/';

      const method = habit.id ? 'PUT' : 'POST';

      const res = await api({ url, method, data: payload })
      console.log(res.status,"hello res status")
      if (res.status === 200 || res.status === 201) {
        await markHabitSynced(habit.uuid);
        //await upsertHabit(habit.uuid, { id: res.data.id });
    }
    } catch (e) {
      console.error('Habit sync error:', e?.response?.data);
    }
  };

  const syncHabitsToApi = async (habits) => {
    for (const habit of habits) {
      await upsertHabitToApi(habit);
    }
  };

  const bootstrap = async () => {
    if (syncing.current) return;
    syncing.current = true;

    try {
      await initDatabase();

      if (!isUserLoggedIn) return;

      console.log('📤 Syncing local habits...');
      const unsynced = await getUnsyncedHabits();
      if (unsynced.length) {
        await syncHabitsToApi(unsynced);
      }

      console.log('📥 Syncing habits from server...');
      const remote = await fetchHabits();
      await syncHabitsFromApi(remote);

      console.log('✅ Habits sync complete');
    } catch (e) {
      console.error('❌ HabitsProvider error:', e);
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
      } else {
        console.log('📴 Offline — habits ready locally');
      }

      unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected) {
          console.log('🌐 Back online — syncing habits');
          bootstrap();
        }
      });
    };

    init();
    
    return () => unsubscribe && unsubscribe();
  }, [isUserLoggedIn]);

  useEffect(() => {
  initialized.current = false;
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
