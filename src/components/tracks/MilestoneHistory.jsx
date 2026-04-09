import { useSupabase } from '../../hooks/useSupabase';
import { Check, X, Clock, Trash2 } from 'lucide-react';

export default function MilestoneHistory({ milestones, onUpdate, onDeleted }) {
  const { updateMilestone, deleteMilestone } = useSupabase();

  if (!milestones || milestones.length === 0) {
    return <p className="text-sm text-slate-500 italic">No milestones yet.</p>;
  }

  const handleStatusToggle = async (m, newStatus) => {
    // Optimistic UI could be implemented here, but we'll await DB for safety
    try {
      const updated = await updateMilestone(m.id, { outcome: newStatus });
      onUpdate(updated);
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const getStyle = (outcome) => {
    if (outcome === 'pass') return "bg-green-50 text-green-800 border-green-200";
    if (outcome === 'fail') return "bg-red-50 text-red-800 border-red-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="space-y-3 mt-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
      {milestones.map((m) => (
        <div key={m.id} className={`p-3.5 rounded-lg border shadow-sm ${getStyle(m.outcome)}`}>
           <div className="flex justify-between items-start mb-2 gap-4">
              <h5 className="font-bold text-[13px] tracking-tight">{m.label}</h5>
              
              {/* Interactive Status Editor */}
              <div className="flex items-center gap-1 bg-white/60 rounded-md p-1 border shadow-xs flex-shrink-0">
                 <button title="Pass" onClick={() => handleStatusToggle(m, 'pass')} className={`p-1 rounded ${m.outcome === 'pass' ? 'bg-green-500 text-white shadow-sm' : 'hover:bg-green-100'} transition`}><Check size={14}/></button>
                 <button title="Fail" onClick={() => handleStatusToggle(m, 'fail')} className={`p-1 rounded ${m.outcome === 'fail' ? 'bg-red-500 text-white shadow-sm' : 'hover:bg-red-100'} transition`}><X size={14}/></button>
                 <button title="Pending" onClick={() => handleStatusToggle(m, 'pending')} className={`p-1 rounded ${m.outcome === 'pending' ? 'bg-slate-700 text-white shadow-sm' : 'hover:bg-slate-200'} transition`}><Clock size={14}/></button>
              </div>
              
              <button title="Delete" onClick={async () => {
                 if (confirm('Delete milestone?')) {
                    await deleteMilestone(m.id);
                    if (onDeleted) onDeleted(m.id);
                    else window.location.reload();
                 }
              }} className="p-1 rounded text-slate-300 hover:text-red-500 transition"><Trash2 size={14}/></button>
           </div>
           
           {m.note && <p className="text-[12px] opacity-80 font-medium leading-tight mb-2">"{m.note}"</p>}
           <p className="text-[9px] opacity-60 font-bold uppercase tracking-widest">{new Date(m.logged_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
