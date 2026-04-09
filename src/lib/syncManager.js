import { db } from './db';
import { supabase } from './supabaseClient';

export const addToSyncQueue = async (type, payload) => {
   await db.syncQueue.add({
      type,
      payload,
      created_at: new Date().toISOString()
   });
};

export const syncOfflineData = async () => {
   if (!navigator.onLine) return;
   
   const records = await db.syncQueue.orderBy('created_at').toArray();
   if (records.length === 0) return;
   
   console.log(`Syncing ${records.length} offline items to Supabase...`);
   
   for (let record of records) {
      try {
         // Determine correct table route
         let table;
         if (record.type === 'session') table = 'sessions';
         if (record.type === 'milestone') table = 'milestones';
         if (record.type === 'note') table = 'notes';
         if (record.type === 'job') table = 'jobs';
         
         const { error } = await supabase.from(table).insert([record.payload]);
         if (!error) {
            await db.syncQueue.delete(record.id);
         }
      } catch (err) {
         console.error('Offline Sync failed for record', record, err);
      }
   }
};

window.addEventListener('online', syncOfflineData);
