export default function NudgeCard({ tracks, sessions }) {
   if (!tracks || tracks.length < 2 || !sessions) return null;
   
   // Get sessions for THIS MONTH only
   const now = new Date();
   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
   
   const monthSessions = sessions.filter(s => new Date(s.logged_at) >= startOfMonth);
   
   // Aggregate hours by track
   const trackHours = {};
   tracks.forEach(t => trackHours[t.id] = { name: t.name, type: t.type, hours: 0 });
   
   monthSessions.forEach(s => {
      if (trackHours[s.track_id]) {
         trackHours[s.track_id].hours += (s.duration_minutes / 60);
      }
   });
   
   // We only check "session" tracks
   const timeTracks = Object.values(trackHours).filter(t => t.type === 'session');
   if (timeTracks.length < 2) return null;
   
   // Find max and min
   let max = timeTracks[0];
   let min = timeTracks[0];
   
   timeTracks.forEach(t => {
      if (t.hours > max.hours) max = t;
      if (t.hours < min.hours) min = t;
   });
   
   // Condition: max must be > 3 hours, and either min is 0 or max > 3x min
   if (max.hours >= 3 && (min.hours === 0 || max.hours > 3 * min.hours)) {
      return (
        <div className="bg-amber-100 border border-amber-200 p-5 rounded-xl shadow-sm text-amber-900 flex items-start gap-3">
          <div className="text-3xl bg-amber-200 p-2 rounded-lg">⚖️</div>
          <div>
            <h4 className="font-extrabold text-base tracking-tight mb-1">Rebalance Nudge</h4>
            <p className="text-sm font-medium leading-relaxed opacity-90">
               You've logged <strong>{max.hours.toFixed(1)}h</strong> on <em>{max.name}</em> this month, but only <strong>{min.hours.toFixed(1)}h</strong> on <em>{min.name}</em>. Consider aiming your next deep work block at {min.name}!
            </p>
          </div>
        </div>
      );
   }
   
   return null;
}
