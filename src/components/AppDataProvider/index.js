import { useEffect, useRef } from 'react';
import { initDatabase } from '../../db/database';
import { syncJournalsFromApi } from '../../db/journalsDb';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../../../api';

export default function AppDataProvider({ children }) {
    const initialized = useRef(false);

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

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const bootstrap = async () => {
        try {
            console.log('📦 Initializing local database...');
            await initDatabase();

            const state = await NetInfo.fetch();
            if (!state.isConnected) {
            console.log('📴 Offline — skipping sync');
            return;
            }

            console.log('🔄 Syncing journals from server...');
            const response = await fetchJournals();
            await syncJournalsFromApi(response);

            console.log('✅ Data ready');
        } catch (e) {
            console.error('❌ AppDataProvider error:', e);
        }
        };
        
        bootstrap();
    }, []);

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
