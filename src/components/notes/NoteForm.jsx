import { useState, useEffect } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { useSupabase } from '../../hooks/useSupabase';

export default function NoteForm({ onNoteAdded }) {
  const [tracks, setTracks] = useState([]);
  const { getTracks } = useSupabase();
  const { createNote } = useNotes();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    content: '',
    tag: 'reference',
    source: '',
    track_id: ''
  });

  useEffect(() => {
    getTracks().then(setTracks);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;
    
    setLoading(true);
    try {
      const added = await createNote({
        content: formData.content,
        tag: formData.tag,
        source: formData.source || null,
        track_id: formData.track_id || null
      });
      onNoteAdded(added);
      setFormData({ content: '', tag: 'reference', source: '', track_id: '' });
    } catch(err) {
       alert(err.message);
    } finally {
       setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 text-lg">Log a Note</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Impact Tag</label>
          <select value={formData.tag} onChange={e=>setFormData({...formData, tag: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none text-sm font-medium bg-white">
             <option value="high">High (Surfaces on Dashboard)</option>
             <option value="medium">Medium</option>
             <option value="reference">Reference</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Source (Optional)</label>
          <input type="text" value={formData.source} onChange={e=>setFormData({...formData, source: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none text-sm font-medium" placeholder="E.g. Book Ch. 4 or URL"/>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Link to Track</label>
          <select value={formData.track_id} onChange={e=>setFormData({...formData, track_id: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none text-sm font-medium bg-white">
             <option value="">General (No Link)</option>
             {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <textarea 
          required
          rows="4"
          value={formData.content} 
          onChange={e=>setFormData({...formData, content: e.target.value})} 
          className="w-full p-3 border border-slate-300 rounded-lg focus:border-blue-500 outline-none text-sm custom-scrollbar bg-slate-50 font-medium leading-relaxed" 
          placeholder="Markdown-capable syntax...&#10;&#10;e.g. **Key takeaway**: Always manage state near where it's used."
        />
      </div>

      <button disabled={loading} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition disabled:opacity-50">
        {loading ? 'Saving to Vault...' : 'Save Note'}
      </button>
    </form>
  )
}
