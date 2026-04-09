import { useState } from 'react';
import { useJobs } from '../../hooks/useJobs';

export default function JobForm({ onJobAdded }) {
  const [loading, setLoading] = useState(false);
  const { createJob } = useJobs();
  
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'applied',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const added = await createJob(formData);
      onJobAdded(added);
      setFormData({ company: '', role: '', status: 'applied', notes: '' });
    } catch (err) {
      alert("Error adding job: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 text-lg mb-4">Log Application</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Company</label>
          <input required type="text" value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 outline-none text-sm font-medium" placeholder="E.g. Google or OpenAI"/>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Role</label>
          <input required type="text" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 outline-none text-sm font-medium" placeholder="E.g. Senior Frontend Engineer"/>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Notes / Feedback (Optional)</label>
        <textarea value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 outline-none text-sm font-medium custom-scrollbar" rows="2" placeholder="Next step format, resume tweaks, or interview feedback..."/>
      </div>
      
      <button disabled={loading} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition text-sm disabled:opacity-50">
        {loading ? 'Saving...' : 'Add to Funnel'}
      </button>
    </form>
  );
}
