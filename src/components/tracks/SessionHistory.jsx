import { useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { Trash2, Edit2, Check, X } from 'lucide-react';

export default function SessionHistory({ sessions, track, onDeleted, onUpdated }) {
  const { deleteSession, updateSession } = useSupabase();
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ duration_minutes: '', progress_percent: '', note: '' });

  if (!sessions || sessions.length === 0) {
    return <p className="text-sm text-slate-500 italic">No history yet. Start learning!</p>;
  }

  const isPages = !!track?.target_count;

  const startEdit = (session) => {
     let prog = session.progress_percent;
     // Convert percent back to page if pages mode
     if (isPages && prog !== null) {
        prog = Math.round((prog / 100) * track.target_count);
     }
     
     setEditingId(session.id);
     setEditData({ 
        duration_minutes: session.duration_minutes, 
        progress_percent: prog !== null ? prog : '', 
        note: session.note || '' 
     });
  };

  const saveEdit = async (session) => {
     try {
       let prog = editData.progress_percent !== '' ? Number(editData.progress_percent) : null;
       if (isPages && prog !== null) {
          prog = (prog / track.target_count) * 100;
          prog = Math.min(100, Math.max(0, prog));
       }
       
       await updateSession(session.id, {
          duration_minutes: Number(editData.duration_minutes),
          progress_percent: prog,
          note: editData.note
       });
       setEditingId(null);
       if (onUpdated) onUpdated();
       else window.location.reload();
     } catch(e) {
       alert("Failed to update session");
     }
  };

  return (
    <div className="space-y-3 mt-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
      {sessions.map((session, index) => {
        const prevSession = sessions.slice(index + 1).find(s => s.progress_percent !== null);
        const prevProgress = prevSession?.progress_percent || 0;
        
        let movementText = null;
        if (session.progress_percent !== null) {
          if (isPages) {
            const prevPage = Math.round((prevProgress / 100) * track.target_count);
            const currPage = Math.round((session.progress_percent / 100) * track.target_count);
            movementText = `Moved from page ${prevPage} → ${currPage} today`;
          } else {
            const pp = prevProgress % 1 === 0 ? prevProgress : prevProgress.toFixed(1);
            const cp = session.progress_percent % 1 === 0 ? session.progress_percent : session.progress_percent.toFixed(1);
            movementText = `Moved from ${pp}% → ${cp}% today`;
          }
        }

        const isEditing = editingId === session.id;

        return (
          <div key={session.id} className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm relative group">
             {isEditing ? (
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <label className="text-xs font-bold text-slate-500 w-12">Mins:</label>
                       <input type="number" className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs" value={editData.duration_minutes} onChange={e => setEditData({...editData, duration_minutes: e.target.value})} />
                    </div>
                    {(isPages || session.progress_percent !== null) && (
                       <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-500 w-12">{isPages ? "Page:" : "%:"}</label>
                          <input type="number" className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs" value={editData.progress_percent} onChange={e => setEditData({...editData, progress_percent: e.target.value})} />
                       </div>
                    )}
                    <div className="flex items-center gap-2">
                       <label className="text-xs font-bold text-slate-500 w-12">Note:</label>
                       <input type="text" className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs" value={editData.note} onChange={e => setEditData({...editData, note: e.target.value})} />
                    </div>
                    <div className="flex gap-2 justify-end mt-1">
                       <button onClick={() => saveEdit(session)} className="bg-blue-600 hover:bg-blue-700 text-white rounded p-1.5 transition"><Check size={14}/></button>
                       <button onClick={() => setEditingId(null)} className="bg-slate-300 hover:bg-slate-400 text-slate-800 rounded p-1.5 transition"><X size={14}/></button>
                    </div>
                 </div>
             ) : (
                 <>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>{Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mr-1">
                          {new Date(session.logged_at).toLocaleDateString()}
                        </span>
                        
                        {/* Action Buttons (visible on hover) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(session)} className="text-slate-300 hover:text-blue-500 transition p-1 bg-white rounded shadow-sm border border-slate-100">
                              <Edit2 size={12}/>
                            </button>
                            <button onClick={async () => {
                              if (confirm('Delete this session?')) {
                                 await deleteSession(session.id);
                                 if (onDeleted) onDeleted(session.id);
                                 else window.location.reload();
                              }
                            }} className="text-slate-300 hover:text-red-500 transition p-1 bg-white rounded shadow-sm border border-slate-100">
                              <Trash2 size={12}/>
                            </button>
                        </div>
                      </div>
                    </div>
                    
                    {movementText && (
                      <p className="text-[13px] text-blue-600 font-semibold mb-1">
                        {movementText}
                      </p>
                    )}
                    
                    {session.note && <p className="text-[13px] text-slate-600 font-medium leading-snug">"{session.note}"</p>}
                 </>
             )}
          </div>
        )
      })}
    </div>
  );
}
