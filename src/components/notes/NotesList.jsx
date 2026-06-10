import { useState } from 'react';
import NoteCard from './NoteCard';
import { Search } from 'lucide-react';

export default function NotesList({ notes, onNoteUpdated, onNoteDeleted }) {
  const [filterTag, setFilterTag] = useState('all');
  const [filterQuery, setFilterQuery] = useState('');

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-slate-50 rounded-2xl border-2 border-slate-200 border-dashed mt-6">
        <div className="text-4xl mb-3 opacity-80">📝</div>
        <h3 className="text-xl font-bold text-slate-700">Your vault is empty</h3>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
          Log your first note above. High importance notes will automatically surface on your dashboard for implicit spaced repetition.
        </p>
      </div>
    );
  }

  const filtered = notes.filter(n => {
    if (filterTag !== 'all' && n.tag !== filterTag) return false;
    if (filterQuery) {
       const q = filterQuery.toLowerCase();
       const matchesSource = n.source?.toLowerCase().includes(q);
       const matchesContent = n.content?.toLowerCase().includes(q);
       return matchesSource || matchesContent;
    }
    return true;
  });

  return (
    <div>
      {/* Filtering Ribbon */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-slate-100 p-2 rounded-lg border border-slate-200">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search content or sources..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded bg-white border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select 
          value={filterTag} 
          onChange={(e) => setFilterTag(e.target.value)}
          className="w-full sm:w-48 text-sm px-3 py-2 rounded bg-white border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="all">All Tags</option>
          <option value="high">High Importance</option>
          <option value="medium">Medium</option>
          <option value="reference">Reference</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center py-10 text-slate-500 font-medium italic">No notes match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(n => (
            <NoteCard 
              key={n.id} 
              note={n} 
              onUpdated={onNoteUpdated}
              onDeleted={onNoteDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
