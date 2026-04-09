import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function JobFunnelChart({ jobs }) {
  if (!jobs || jobs.length === 0) return null;

  const counts = { applied: 0, round1: 0, round2: 0, offer: 0, rejected: 0 };
  jobs.forEach(j => {
    if (counts[j.status] !== undefined) counts[j.status]++;
  });

  const data = [
    { name: 'Applied', count: counts.applied, color: '#3b82f6' },
    { name: 'Round 1', count: counts.round1, color: '#a855f7' },
    { name: 'Round 2', count: counts.round2, color: '#ec4899' },
    { name: 'Offers', count: counts.offer, color: '#10b981' },
    { name: 'Rejected', count: counts.rejected, color: '#ef4444' },
  ];

  // Auto-generate deep insight based on data logic requested
  let insight = "Keep applying! It takes volume to find the right fit.";
  const total = jobs.length;
  
  if (counts.offer > 0) {
    insight = `Excellent! You have an offer rate of ${Math.round((counts.offer/total)*100)}% so far.`;
  } else if (counts.rejected > 3 && (counts.round1 + counts.round2) === 0) {
    insight = "Most of your rejections happen immediately. Time to polish your resume and portfolio.";
  } else if (counts.rejected > 2 && counts.round1 > 0) {
    insight = "You're getting past the screen, but dropping off in interviews. Focus on interview prep or leetcode.";
  }

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg text-white">
      <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-widest">Analytics</h3>
      
      <div className="h-56 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30, top: 10, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#cbd5e1', fontWeight: 600 }} width={75} />
            <Tooltip 
              cursor={{fill: '#1e293b'}} 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right', fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-blue-950/50 p-4 rounded-lg border border-blue-900/50">
        <p className="text-sm text-blue-200 font-medium leading-relaxed">
           <span className="mr-2">💡</span>{insight}
        </p>
      </div>
    </div>
  );
}
