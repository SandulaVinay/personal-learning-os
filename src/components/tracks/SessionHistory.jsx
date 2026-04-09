import { useSupabase } from '../../hooks/useSupabase';
import { Trash2 } from 'lucide-react';

export default function SessionHistory({ sessions, track, onDeleted }) {
  const { deleteSession } = useSupabase();
  if (!sessions || sessions.length === 0) {
    return <p className="text-sm text-slate-500 italic">No history yet. Start learning!</p>;
  }

  const isPages = !!track?.target_count;

  return (
    <div className="space-y-3 mt-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
      {sessions.map((session, index) => {
        // Calculate velocity delta based on previous chronological session (next index)
        const prevSession = sessions.slice(index + 1).find(s => s.progress_percent !== null);
        const prevProgress = prevSession?.progress_percent || 0;
        
        let movementText = null;
        if (session.progress_percent !== null) {
          if (isPages) {
            const prevPage = Math.round((prevProgress / 100) * track.target_count);
            const currPage = Math.round((session.progress_percent / 100) * track.target_count);
            movementText = `Moved from page ${prevPage} → ${currPage} today`;
          } else {
            // Check for decimals and round reasonably
            const pp = prevProgress % 1 === 0 ? prevProgress : prevProgress.toFixed(1);
            const cp = session.progress_percent % 1 === 0 ? session.progress_percent : session.progress_percent.toFixed(1);
            movementText = `Moved from ${pp}% → ${cp}% today`;
          }
        }

        return (
          <div key={session.id} className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex justify-between font-bold text-slate-800 mb-1">
              <span>{Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  {new Date(session.logged_at).toLocaleDateString()}
                </span>
                <button onClick={async () => {
                  if (confirm('Delete this session?')) {
                     await deleteSession(session.id);
                     if (onDeleted) onDeleted(session.id);
                     else window.location.reload();
                  }
                }} className="text-slate-300 hover:text-red-500 transition">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
            
            {movementText && (
              <p className="text-[13px] text-blue-600 font-semibold mb-1">
                {movementText}
              </p>
            )}
            
            {session.note && <p className="text-[13px] text-slate-600 font-medium leading-snug">"{session.note}"</p>}
          </div>
        )
      })}
    </div>
  );
}
