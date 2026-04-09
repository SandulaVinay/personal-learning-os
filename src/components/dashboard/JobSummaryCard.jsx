export default function JobSummaryCard({ jobs }) {
  if (!jobs || jobs.length === 0) return null;
  
  const total = jobs.length;
  const offers = jobs.filter(j => j.status === 'offer').length;
  const rejections = jobs.filter(j => j.status === 'rejected').length;
  const active = total - offers - rejections;
  
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-lg flex items-center gap-2 tracking-tight">
          <span className="text-xl">💼</span> Job Funnel
        </h3>
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/50 px-2 py-1 rounded">Summary</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-slate-700/50">
           <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Total</p>
           <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-slate-700/50">
           <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Active</p>
           <p className="text-2xl font-bold text-blue-400">{active}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-slate-700/50">
           <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Offers</p>
           <p className="text-2xl font-bold text-green-400">{offers}</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-slate-700/50">
           <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Rejects</p>
           <p className="text-2xl font-bold text-red-400">{rejections}</p>
        </div>
      </div>
    </div>
  );
}
