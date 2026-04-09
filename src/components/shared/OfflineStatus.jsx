import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { syncOfflineData } from '../../lib/syncManager';

export default function OfflineStatus() {
   const [isOnline, setIsOnline] = useState(navigator.onLine);
   const [isSyncing, setIsSyncing] = useState(false);
   
   const queueCount = useLiveQuery(() => db.syncQueue.count()) || 0;

   useEffect(() => {
     const setOnline = async () => {
         setIsOnline(true);
         setIsSyncing(true);
         await syncOfflineData();
         setIsSyncing(false);
     };
     const setOffline = () => setIsOnline(false);

     window.addEventListener('online', setOnline);
     window.addEventListener('offline', setOffline);

     return () => {
       window.removeEventListener('online', setOnline);
       window.removeEventListener('offline', setOffline);
     };
   }, []);

   if (isOnline && queueCount === 0 && !isSyncing) return null;

   return (
     <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
       {!isOnline && (
          <div className="bg-red-900/90 text-white px-5 py-2.5 rounded-full shadow-2xl border border-red-800 text-sm font-bold flex items-center justify-center gap-2 animate-pulse backdrop-blur-sm tracking-wide">
            <span className="text-lg">🏕️</span> Airplane Mode
          </div>
       )}
       {queueCount > 0 && (
          <div className="bg-amber-900/90 text-white px-5 py-2.5 rounded-full shadow-2xl border border-amber-800 text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-sm tracking-wide">
            <span className="text-lg">📦</span> {queueCount} log{queueCount > 1 ? 's' : ''} in local vault
          </div>
       )}
       {isSyncing && (
          <div className="bg-blue-900/90 text-white px-5 py-2.5 rounded-full shadow-2xl border border-blue-800 text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-sm tracking-wide">
            <span className="animate-spin text-lg">⚡</span> Syncing to Supabase...
          </div>
       )}
     </div>
   );
}
