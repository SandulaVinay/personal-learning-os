import { useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { Plus, X } from 'lucide-react';

export default function TrackForm({ onTrackAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const { createTrack } = useSupabase();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'session',
    description: '',
    target_hours: '',
    target_count: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Parse integers/floats based on inputs
      const hrs = parseFloat(formData.target_hours);
      const cnt = parseInt(formData.target_count);

      const newTrack = await createTrack({
         name: formData.name,
         type: formData.type,
         description: formData.description || null,
         target_hours: !isNaN(hrs) ? hrs : null,
         target_count: !isNaN(cnt) ? cnt : null,
      });
      onTrackAdded(newTrack);
      setIsOpen(false);
      setFormData({ name: '', type: 'session', description: '', target_hours: '', target_count: '' });
    } catch (err) {
      alert("Error creating track: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition"
      >
        <Plus size={20} /> New Track
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 mt-2 animation-fade-in">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-slate-800">Create New Track</h2>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Track Name</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" placeholder="e.g. Reading Atomic Habits" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Track Type</label>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white transition">
            <option value="session">Time-based (Sessions / Hours)</option>
            <option value="milestone">Count-based (Milestones / Count)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" rows="2" placeholder="Briefly describe what you're tracking..."></textarea>
        </div>

        {formData.type === 'session' ? (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Hours (Optional)</label>
              <input type="number" step="0.5" min="0" value={formData.target_hours} onChange={e => setFormData({...formData, target_hours: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" placeholder="e.g. 20" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" title="Useful for tracking book pages instead of %">Total Units/Pages (Optional)</label>
              <input type="number" min="0" value={formData.target_count} onChange={e => setFormData({...formData, target_count: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" placeholder="e.g. 300 pages" />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Count (Optional)</label>
            <input type="number" min="0" value={formData.target_count} onChange={e => setFormData({...formData, target_count: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" placeholder="e.g. 100" />
          </div>
        )}

        <div className="pt-3">
          <button disabled={loading} type="submit" className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-800 transition disabled:opacity-50">
            {loading ? 'Creating...' : 'Save Track'}
          </button>
        </div>
      </form>
    </div>
  );
}