import { useMemo } from 'react';
import { Flame, BookOpen, XCircle, Clock } from 'lucide-react';

export default function ActivityCalendar({ sessions }) {
   const now = new Date();
   now.setHours(0,0,0,0);
   const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });

   const grid = useMemo(() => {
      const year = now.getFullYear();
      const month = now.getMonth();
      const numDays = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      
      const arr = [];
      // Pad empty slots before 1st of month
      for (let i = 0; i < firstDay; i++) arr.push(null);
      
      // Fill days
      for (let i = 1; i <= numDays; i++) {
         const d = new Date(year, month, i);
         d.setHours(0,0,0,0);
         arr.push(d);
      }
      return arr;
   }, [now]);

   const activityMap = useMemo(() => {
      const map = {};
      sessions?.forEach(s => {
         const d = new Date(s.logged_at);
         d.setHours(0,0,0,0);
         map[d.getTime()] = true;
      });
      return map;
   }, [sessions]);

   return (
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
         <div className="flex justify-between items-center mb-5">
            <h3 className="font-extrabold text-slate-800 text-[15px] flex items-center gap-2 tracking-tight">
               <Flame className="text-orange-500" size={18} fill="currentColor" />
               Daily Streak
            </h3>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">{currentMonth}</span>
         </div>
         
         <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
               <div key={d} className="text-center text-[10px] font-bold text-slate-400">{d}</div>
            ))}
         </div>
         
         <div className="grid grid-cols-7 gap-1.5">
            {grid.map((date, idx) => {
               if (!date) return <div key={`empty-${idx}`} className="aspect-square rounded-md"></div>;
               
               const ts = date.getTime();
               const isToday = ts === now.getTime();
               const isFuture = ts > now.getTime();
               const hasActivity = activityMap[ts];
               const isMissed = !hasActivity && !isFuture && !isToday;
               const isMissedToday = !hasActivity && isToday;

               let boxStyle = "bg-slate-50 border-slate-100";
               let content = <span className="text-xs font-bold text-slate-400">{date.getDate()}</span>;
               
               if (hasActivity) {
                  boxStyle = "bg-green-100 border-green-200 text-green-700 shadow-sm ring-1 ring-green-100";
                  content = <BookOpen size={14} className="text-green-600" />;
               } else if (isMissed) {
                  boxStyle = "bg-red-50/50 border-red-50 text-red-500";
                  content = <XCircle size={14} className="text-red-300 opacity-60" />;
               } else if (isFuture) {
                  boxStyle = "bg-slate-50/30 text-slate-300 border-transparent";
               } else if (isMissedToday) {
                  boxStyle = "bg-orange-50 border-orange-300 text-orange-600 animate-pulse border-2 shadow-sm";
                  content = <span className="text-xs font-bold text-orange-600">{date.getDate()}</span>;
               }

               return (
                  <div 
                    key={ts} 
                    className={`aspect-square rounded-md border flex items-center justify-center transition-all ${boxStyle}`} 
                    title={date.toLocaleDateString()}
                  >
                     {content}
                  </div>
               );
            })}
         </div>
      </div>
   );
}
