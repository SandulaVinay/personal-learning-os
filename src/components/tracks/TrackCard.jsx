import { useState, useEffect } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import confetti from 'canvas-confetti';
import TimerWidget from './TimerWidget';
import SessionLogger from './SessionLogger';
import SessionHistory from './SessionHistory';
import MilestoneLogger from './MilestoneLogger';
import MilestoneHistory from './MilestoneHistory';
import { ChevronDown, ChevronUp, Trash2, Edit2, Check, X } from 'lucide-react';

export default function TrackCard({ track }) {
  const isTime = track.type === 'session';
  const { getSessions, getMilestones, logSession, logMilestone, deleteTrack, updateTrack } = useSupabase();
  
  const [expanded, setExpanded] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  
  // Track Edit State
  const [editingTrack, setEditingTrack] = useState(false);
  const [editTrackData, setEditTrackData] = useState({ name: '', target_count: '', target_hours: '' });

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
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleMilestoneLogged = async (data) => {
    const newMilestone = await logMilestone(data);
    setMilestones([newMilestone, ...milestones]);
  };

  const handleMilestoneUpdate = (updated) => {
    setMilestones(milestones.map(m => m.id === updated.id ? updated : m));
  };
  
  const startEditTrack = () => {
    setEditingTrack(true);
    setEditTrackData({
      name: track.name,
      target_count: track.target_count || '',
      target_hours: track.target_hours || ''
    });
  };

  const saveEditTrack = async () => {
    try {
      const updates = { name: editTrackData.name };
      if (editTrackData.target_count !== '') updates.target_count = Number(editTrackData.target_count);
      else updates.target_count = null;
      if (editTrackData.target_hours !== '') updates.target_hours = Number(editTrackData.target_hours);
      else updates.target_hours = null;
      
      await updateTrack(track.id, updates);
      window.location.reload();
    } catch(e) {
      alert("Failed to update track. Ensure SQL UPDATE policies are enabled in Supabase.");
    }
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
     }
  }

  const lastActiveText = isTime ? sessionLastActive : mmLastActive;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        {editingTrack ? (
          <div className="flex-1 mr-4 bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-inner">
             <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={editTrackData.name} 
                  onChange={e => setEditTrackData({...editTrackData, name: e.target.value})} 
                  placeholder="Track Name"
                  className="font-bold text-sm border border-slate-300 rounded px-2 py-1.5 focus:outline-blue-500"
                />
                <div className="flex gap-2">
                   {isTime && (
                     <div className="flex flex-col gap-1 w-1/2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase">Target Hours</label>
                       <input 
                         type="number" 
                         value={editTrackData.target_hours} 
                         onChange={e => setEditTrackData({...editTrackData, target_hours: e.target.value})} 
                         placeholder="e.g. 100"
                         className="text-xs border border-slate-300 rounded px-2 py-1.5"
                       />
                     </div>
                   )}
                   <div className="flex flex-col gap-1 flex-1">
                     <label className="text-[10px] font-bold text-slate-500 uppercase">{isTime ? 'Target Pages (Optional)' : 'Target Count (Optional)'}</label>
                     <input 
                       type="number" 
                       value={editTrackData.target_count} 
                       onChange={e => setEditTrackData({...editTrackData, target_count: e.target.value})} 
                       placeholder="e.g. 400"
                       className="text-xs border border-slate-300 rounded px-2 py-1.5"
                     />
                   </div>
                </div>
                <div className="flex gap-2 justify-end mt-2">
                   <button onClick={saveEditTrack} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1.5 text-xs font-bold transition flex items-center gap-1"><Check size={14}/> Save</button>
                   <button onClick={() => setEditingTrack(false)} className="bg-slate-300 hover:bg-slate-400 text-slate-800 rounded px-3 py-1.5 text-xs font-bold transition flex items-center gap-1"><X size={14}/> Cancel</button>
                </div>
             </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 group">
              <h3 className="font-bold text-lg text-slate-900">{track.name}</h3>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={startEditTrack} className="text-slate-300 hover:text-blue-500 transition p-1 bg-white rounded shadow-sm border border-slate-100">
                  <Edit2 size={12}/>
                </button>
                <button onClick={async () => {
                   if (confirm("Are you sure you want to completely delete this track? This breaks all stats associated with it!")) {
                     await deleteTrack(track.id);
                     window.location.reload();
                   }
                }} className="text-slate-300 hover:text-red-500 transition p-1 bg-white rounded shadow-sm border border-slate-100">
                  <Trash2 size={12}/>
                </button>
              </div>
            </div>
            {progressBadge && (
              <span className="inline-block mt-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">
                {progressBadge}
              </span>
            )}
          </div>
        )}
        <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest flex-shrink-0 ${isTime ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
          {isTime ? 'Time' : 'Milestone'}
        </span>
      </div>
      
      {track.description && !editingTrack && (
        <p className="text-sm text-slate-500 mb-5 line-clamp-2 leading-relaxed">{track.description}</p>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
            {isTime ? 'Active' : 'Streak'}
          </p>
          <p className="font-bold text-slate-800 text-sm">
            {isTime ? <>{daysActive} <span className="text-[10px] font-medium text-slate-500 lowercase">d</span></> : <>{streak} 🔥</>}
          </p>
        </div>
        
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
             {isTime ? 'Hours' : 'Win Rate'}
           </p>
           <p className="font-bold text-slate-800 text-sm">
             {isTime ? totalHours : passRate}
           </p>
        </div>
        
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
