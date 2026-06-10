import { useState, useEffect } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { useNotes } from '../../hooks/useNotes';
import { useSupabase } from '../../hooks/useSupabase';

export default function NoteCard({ note, minimize = false, onDeleted, onUpdated }) {
  const { deleteNote, updateNote } = useNotes();
  const { getTracks } = useSupabase();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ 
    content: note.content, 
    tag: note.tag, 
    source: note.source || '',
    track_id: note.track_id || ''
  });
  const [tracks, setTracks] = useState([]);
  
  const tagColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    reference: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  useEffect(() => {
    if (isEditing && tracks.length === 0) {
      getTracks().then(setTracks);
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      const updated = await updateNote(note.id, {
        content: editData.content,
        tag: editData.tag,
        source: editData.source || null,
        track_id: editData.track_id || null
      });
      setIsEditing(false);
      if (onUpdated) onUpdated(updated);
      else window.location.reload();
    } catch (e) {
      alert("Failed to update note");
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition hover:shadow-md ${minimize ? 'p-4' : 'p-5'}`}>
       
       {isEditing ? (
         <div className="space-y-3">
           <div className="flex justify-between items-center border-b border-slate-50 pb-2">
             <span className="text-xs font-bold text-slate-700">Edit Note</span>
             <div className="flex gap-2">
               <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded p-1 transition"><Check size={14}/></button>
               <button onClick={() => setIsEditing(false)} className="bg-slate-300 hover:bg-slate-400 text-slate-800 rounded p-1 transition"><X size={14}/></button>
             </div>
           </div>
           
           <div>
             <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Content</label>
             <textarea 
               value={editData.content} 
               onChange={e => setEditData({...editData, content: e.target.value})} 
               className="w-full text-xs p-2 border border-slate-300 rounded focus:border-blue-500 outline-none font-medium" 
               rows="3"
             />
           </div>

           <div className="flex gap-2">
             <div className="flex-1">
               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tag</label>
               <select 
                 value={editData.tag} 
                 onChange={e => setEditData({...editData, tag: e.target.value})} 
                 className="w-full text-xs p-2 border border-slate-300 rounded bg-white outline-none font-medium"
               >
                 <option value="high">High</option>
                 <option value="medium">Medium</option>
                 <option value="reference">Reference</option>
               </select>
             </div>
             <div className="flex-1">
               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Source</label>
               <input 
                 type="text" 
                 value={editData.source} 
                 onChange={e => setEditData({...editData, source: e.target.value})} 
                 className="w-full text-xs p-2 border border-slate-300 rounded outline-none font-medium"
               />
             </div>
           </div>

           <div>
             <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Link to Track</label>
             <select 
               value={editData.track_id} 
               onChange={e => setEditData({...editData, track_id: e.target.value})} 
               className="w-full text-xs p-2 border border-slate-300 rounded bg-white outline-none font-medium"
             >
               <option value="">General (No Link)</option>
               {tracks.map(t => (
                 <option key={t.id} value={t.id}>{t.name}</option>
               ))}
             </select>
           </div>
         </div>
       ) : (
         <>
           <div className="mb-3 flex justify-between items-start border-b border-slate-50 pb-3">
             <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${tagColors[note.tag]}`}>
               {note.tag}
             </span>
             <div className="flex gap-2 items-center">
               <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                 {new Date(note.created_at).toLocaleDateString()}
               </span>
               <button onClick={() => setIsEditing(true)} className="text-slate-300 hover:text-blue-500 transition p-1" title="Edit Note">
                  <Edit2 size={13}/>
               </button>
               <button onClick={async () => {
                  if (confirm('Delete this note?')) {
                     await deleteNote(note.id);
                     if (onDeleted) onDeleted(note.id);
                     else window.location.reload();
                  }
               }} className="text-slate-300 hover:text-red-500 transition p-1" title="Delete Note">
                  <Trash2 size={13}/>
               </button>
             </div>
           </div>
           
           <div className={`prose prose-sm prose-slate max-w-none text-slate-800 font-medium leading-relaxed whitespace-pre-wrap ${minimize ? 'text-xs line-clamp-3' : 'text-[13px] mb-4'}`}>
              {note.content}
           </div>
           
           {!minimize && (
             <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <span>{note.source ? `From: ${note.source}` : 'General'}</span>
                <span>{note.tracks?.name ? `Track: ${note.tracks.name}` : ''}</span>
             </div>
           )}
         </>
       )}
    </div>
  );
}
