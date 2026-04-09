import Dexie from 'dexie';

export const db = new Dexie('LearningOSDatabase');

db.version(1).stores({
  syncQueue: '++id, type, payload, created_at' 
});
