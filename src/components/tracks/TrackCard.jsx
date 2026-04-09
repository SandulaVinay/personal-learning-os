import { useState, useEffect } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import TimerWidget from './TimerWidget';
import SessionLogger from './SessionLogger';
import SessionHistory from './SessionHistory';
import MilestoneLogger from './MilestoneLogger';
import MilestoneHistory from './MilestoneHistory';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function TrackCard({ track }) {
  const isTime = track.type === 'session';
  const { getSessions, getMilestones, logSession, logMilestone } = useSupabase();
  
  const [expanded, setExpanded] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  
  useEffect(() => {
    if (isTime) {
      getSessions(track.id).then(setSessions);
    } else {
      getMilestones(track.id).then(setMilestones);
    }
  }, [track.id, isTime]);

  const handleSessionLogged = async (data) => {
    const newSession = await logSession(data);
    setSessions([newSession, ...sessions]);
  };

  const handleMilestoneLogged = async (data) => {
    const newMilestone = await logMilestone(data);
    setMilestones([newMilestone, ...milestones]);
  };

  const handleMilestoneUpdate = (updated) => {
    setMilestones(milestones.map(m => m.id === updated.id ? updated : m));
  };

  // -------------------------------------------------------------
  // COMPUTED STATS: SESSIONS
  // -------------------------------------------------------------
  const startDate = new Date(track.started_at);
  const now = new Date();
  const daysActive = Math.floor(Math.max(0, now - startDate) / (1000 * 60 * 60 * 24));
  
  const totalMinutes = sessions.reduce((acc, curr) => acc + curr.duration_minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const sessionLastActive = sessions.length > 0 ? new Date(sessions[0].logged_at).toLocaleDateString() : 'Never';
  
  // Progress badge
  let progressBadge = null;
  const latestProgress = sessions.find(s => s.progress_percent !== null)?.progress_percent;
  if (latestProgress !== undefined && isTime) {
    if (track.target_count) { 
      const page = Math.round((latestProgress / 100) * track.target_count);
      progressBadge = `Page ${page} / ${track.target_count}`;
    } else {
      progressBadge = `${latestProgress % 1 === 0 ? latestProgress : latestProgress.toFixed(1)}% Complete`;
    }
  }

  // -------------------------------------------------------------
  // COMPUTED STATS: MILESTONES
  // -------------------------------------------------------------
  let passRate = '--%';
  let streak = 0;
  const mmLastActive = milestones.length > 0 ? new Date(milestones[0].logged_at).toLocaleDateString() : 'Never';

  if (!isTime && milestones.length > 0) {
     const passes = milestones.filter(m => m.outcome === 'pass').length;
     passRate = Math.round((passes / milestones.length) * 100) + '%';
     
     for (let m of milestones) {
       if (m.outcome === 'pass') streak++;
       else if (m.outcome === 'fail') break; 
       // Ignored pending ones for streak destruction? Spec didn't say, let's break on fail
     }
  }

  // Combine top level metadata depending on type
  const lastActiveText = isTime ? sessionLastActive : mmLastActive;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{track.name}</h3>
          {progressBadge && (
            <span className="inline-block mt-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">
              {progressBadge}
            </span>
          )}
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest flex-shrink-0 ${isTime ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
          {isTime ? 'Time' : 'Milestone'}
        </span>
      </div>
      
      {track.description && (
        <p className="text-sm text-slate-500 mb-5 line-clamp-2 leading-relaxed">{track.description}</p>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {/* Metric 1 */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
            {isTime ? 'Active' : 'Streak'}
          </p>
          <p className="font-bold text-slate-800 text-sm">
            {isTime ? <>{daysActive} <span className="text-[10px] font-medium text-slate-500 lowercase">d</span></> : <>{streak} 🔥</>}
          </p>
        </div>
        
        {/* Metric 2 */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
             {isTime ? 'Hours' : 'Win Rate'}
           </p>
           <p className="font-bold text-slate-800 text-sm">
             {isTime ? totalHours : passRate}
           </p>
        </div>
        
        {/* Metric 3 (Target) */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Target</p>
          <p className="font-bold text-slate-800 text-[12px] leading-tight flex items-center justify-center">
             {isTime 
               ? (
                 <span className="flex flex-col">
                   {track.target_hours && <span>{track.target_hours}h</span>}
                   {track.target_count && <span className="text-slate-500">{track.target_count} pages</span>}
                   {!track.target_hours && !track.target_count && 'None'}
                 </span>
               ) 
               : (track.target_count ? `${track.target_count} total` : 'None')}
          </p>
        </div>
      </div>
      
      {/* Footer / Expand Toggle */}
      <div className="mt-5 border-t border-slate-100 pt-3 flex justify-between items-center bg-white">
         <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">Last: {lastActiveText}</span>
         <button onClick={() => setExpanded(!expanded)} className={`flex items-center gap-1 text-[13px] font-bold transition px-3 py-1.5 rounded-lg active:scale-95 ${isTime ? 'text-blue-600 hover:text-blue-800 bg-blue-50' : 'text-purple-600 hover:text-purple-800 bg-purple-50'}`}>
           {expanded ? <><ChevronUp size={16}/> Collapse</> : <><ChevronDown size={16}/> Log Work</>}
         </button>
      </div>

      {/* Expanded Content View: SESSIONS */}
      {expanded && isTime && (
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <TimerWidget track={track} onSessionLogged={handleSessionLogged} />
          <SessionLogger track={track} onSessionLogged={handleSessionLogged} />
          <div className="bg-slate-50 -mx-5 -mb-5 p-5 border-t border-slate-100 rounded-b-xl">
            <h4 className="font-bold text-slate-700 text-sm mb-3">Session History</h4>
            <SessionHistory sessions={sessions} track={track} />
          </div>
        </div>
      )}
      
      {/* Expanded Content View: MILESTONES */}
      {expanded && !isTime && (
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <MilestoneLogger track={track} onMilestoneLogged={handleMilestoneLogged} />
          <div className="bg-slate-50 -mx-5 -mb-5 p-5 border-t border-slate-100 rounded-b-xl">
            <h4 className="font-bold text-slate-700 text-sm mb-3">Milestone List</h4>
            <MilestoneHistory milestones={milestones} onUpdate={handleMilestoneUpdate} />
          </div>
        </div>
      )}
    </div>
  );
}
