import { useState } from 'react';

export default function MilestoneLogger({ track, onMilestoneLogged }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    outcome: 'pending',
    note: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.label.trim()) return alert("Label is required.");
    
    setLoading(true);
    try {
      await onMilestoneLogged({
        track_id: track.id,
        label: formData.label,
        outcome: formData.outcome,
        note: formData.note || null
      });
      setFormData({ label: '', outcome: 'pending', note: '' });
    } catch (err) {
      alert("Failed to log: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 shadow-sm">
      <h4 className="font-semibold text-slate-800 text-sm">Log New Milestone</h4>
      
      <div className="flex gap-3">
        <div className="flex-[2]">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Label</label>
          <input required type="text" value={formData.label} onChange={e=>setFormData({...formData, label: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-purple-500 outline-none text-sm font-medium" placeholder="e.g. Two Sum"/>
        </div>
        <div className="flex-[1]">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Outcome</label>
          <select value={formData.outcome} onChange={e=>setFormData({...formData, outcome: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-purple-500 outline-none text-sm font-medium bg-white">
             <option value="pending">Pending</option>
             <option value="pass">Pass</option>
             <option value="fail">Fail</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Note (Optional)</label>
        <input type="text" value={formData.note} onChange={e=>setFormData({...formData, note: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-purple-500 outline-none text-sm font-medium" placeholder="Takeaways or edges cases?"/>
      </div>
      
      <button disabled={loading} className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg transition text-sm">
        {loading ? 'Logging...' : 'Log Milestone'}
      </button>
    </form>
  )
}
