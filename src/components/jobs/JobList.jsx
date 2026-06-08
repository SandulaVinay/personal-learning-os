import { Trash2 } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import confetti from 'canvas-confetti';

export default function JobList({ jobs, onJobUpdated, onJobDeleted }) {
  const { updateJob, deleteJob } = useJobs();

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
        <div className="text-4xl mb-3 opacity-80">💼</div>
        <h3 className="text-lg font-bold text-slate-700">No applications yet</h3>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">Treat job hunting like a sales funnel. Start tracking your applications to measure conversion rates.</p>
      </div>
    );
  }

  const handleStatusChange = async (job, newStatus) => {
    try {
      const updated = await updateJob(job.id, newStatus, job.notes);
      onJobUpdated(updated);
      if (newStatus === 'offer') {
         // Celebratory double-burst
         confetti({
           particleCount: 150,
           spread: 80,
           origin: { y: 0.6 }
         });
         setTimeout(() => {
           confetti({
             particleCount: 100,
             spread: 100,
             origin: { y: 0.5 }
           });
         }, 350);
      }
    } catch(e) {
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'round1': case 'round2': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 text-lg mb-2">Application Tracker</h3>
      {jobs.map(job => (
        <div key={job.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
             <h4 className="font-bold text-slate-900">{job.company}</h4>
             <p className="text-[13px] font-medium text-slate-500">{job.role}</p>
             <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Applied: {new Date(job.applied_at).toLocaleDateString()}</p>
          </div>
          
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <select 
              value={job.status} 
              onChange={(e) => handleStatusChange(job, e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold outline-none cursor-pointer border-0 ring-1 ring-inset ring-black/5 ${getStatusColor(job.status)}`}
            >
               <option value="applied">Applied</option>
               <option value="round1">Round 1</option>
               <option value="round2">Round 2</option>
               <option value="offer">Offer 🎉</option>
               <option value="rejected">Rejected</option>
            </select>
            <button onClick={async () => {
               if (confirm('Delete application?')) {
                  await deleteJob(job.id);
                  if (onJobDeleted) onJobDeleted(job.id);
                  else window.location.reload();
               }
            }} className="text-slate-300 hover:text-red-500 transition p-1">
               <Trash2 size={16}/>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
