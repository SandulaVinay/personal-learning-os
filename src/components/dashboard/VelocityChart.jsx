import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function VelocityChart({ sessions }) {
  if (!sessions) return null;

  // Aggregate last 8 weeks
  const data = [];
  const today = new Date();
  
  for (let i = 7; i >= 0; i--) {
     const startOfWeek = new Date(today);
     // Shift to start of the week (Sunday), then subtract weeks
     startOfWeek.setDate(today.getDate() - today.getDay() - (i * 7));
     startOfWeek.setHours(0,0,0,0);
     
     const endOfWeek = new Date(startOfWeek);
     endOfWeek.setDate(startOfWeek.getDate() + 6);
     endOfWeek.setHours(23,59,59,999);
     
     const weekSessions = sessions.filter(s => {
        const d = new Date(s.logged_at);
        return d >= startOfWeek && d <= endOfWeek;
     });
     
     const totalMins = weekSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
     const totalHrs = (totalMins / 60).toFixed(1);
     
     const label = i === 0 ? 'This Wk' : i === 1 ? 'Last Wk' : `${i}w ago`;
     
     data.push({ name: label, hours: parseFloat(totalHrs) });
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-full">
       <div className="flex items-center gap-3 mb-6">
         <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">⏱️</div>
         <div>
           <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Learning Velocity</h3>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rolling 8 Weeks</p>
         </div>
       </div>

       <div className="h-64 w-full">
         <ResponsiveContainer width="100%" height="100%">
           <BarChart data={data} margin={{ left: -30, right: 10, top: 10, bottom: 0 }}>
             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} />
             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} />
             <Tooltip 
                cursor={{fill: '#f1f5f9'}} 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
             />
             <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={28} />
           </BarChart>
         </ResponsiveContainer>
       </div>
    </div>
  );
}
