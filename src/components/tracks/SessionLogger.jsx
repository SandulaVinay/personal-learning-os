import { useState } from 'react';

export default function SessionLogger({ track, onSessionLogged }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hours: '',
    minutes: '',
    progress: '',
    note: ''
  });

  const isPages = !!track.target_count;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const h = parseInt(formData.hours) || 0;
    const m = parseInt(formData.minutes) || 0;
    const totalMinutes = (h * 60) + m;
    
    if (totalMinutes === 0) return alert('Enter a valid duration to log a session.');

    let prog = parseFloat(formData.progress);
    if (!isNaN(prog)) {
      if (isPages) {
        // Convert page number to percentage seamlessly
        prog = (prog / track.target_count) * 100;
      }
      prog = Math.min(100, Math.max(0, prog));
    } else {
      prog = null;
    }

    setLoading(true);
    await onSessionLogged({
      track_id: track.id,
      duration_minutes: totalMinutes,
      progress_percent: prog,
      note: formData.note || null
    });
    setLoading(false);
    setFormData({ hours: '', minutes: '', progress: '', note: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 shadow-sm">
      <h4 className="font-semibold text-slate-800 text-sm">Manual Entry</h4>
      
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Hours</label>
          <input type="number" min="0" value={formData.hours} onChange={e=>setFormData({...formData, hours: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 outline-none text-sm font-medium"/>
        </div>
        <div className="flex-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Minutes</label>
          <input type="number" min="0" max="59" value={formData.minutes} onChange={e=>setFormData({...formData, minutes: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 outline-none text-sm font-medium"/>
        </div>
        <div className="flex-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1" title={isPages ? "Enter page number" : "Enter percentage"}>
            {isPages ? `Page (of ${track.target_count})` : 'Total %'}
          </label>
          <input type="number" min="0" max={isPages ? track.target_count : 100} value={formData.progress} onChange={e=>setFormData({...formData, progress: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 outline-none text-sm font-medium" placeholder={isPages ? "e.g. 15" : "e.g. 50"}/>
        </div>
      </div>
      
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Note (Optional)</label>
        <input type="text" value={formData.note} onChange={e=>setFormData({...formData, note: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 outline-none text-sm font-medium" placeholder="What did you learn?"/>
      </div>
      
      <button disabled={loading} className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition text-sm">
        {loading ? 'Logging...' : 'Log Session Manually'}
      </button>
    </form>
  );
}
