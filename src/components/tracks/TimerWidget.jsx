import { useTimer } from '../../hooks/useTimer';
import { Play, Square, Check, X } from 'lucide-react';
import { useState } from 'react';

export default function TimerWidget({ track, onSessionLogged }) {
  const { isRunning, elapsedSeconds, start, stop, reset } = useTimer();
  const [loading, setLoading] = useState(false);
  const [prompting, setPrompting] = useState(false);
  const [pageValue, setPageValue] = useState('');
  const [noteValue, setNoteValue] = useState('');

  const isPages = !!track.target_count;

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopClick = async () => {
    stop();
    const durationMinutes = Math.floor(elapsedSeconds / 60);
    
    // We only log if at least 1 minute elapsed to prevent spam
    if (durationMinutes >= 1) {
       setPrompting(true);
    } else {
      alert("Session too short to log (less than 1 minute).");
      reset();
    }
  };

  const submitSession = async (mins, progress) => {
    setLoading(true);
    
    let defaultNote = 'Timer auto-submission';
    if (isPages && pageValue) {
      defaultNote = `Logged up to page ${pageValue}`;
    }
    
    await onSessionLogged({
      track_id: track.id,
      duration_minutes: mins,
      progress_percent: progress,
      note: noteValue || defaultNote,
    });
    setLoading(false);
    setPrompting(false);
    setPageValue('');
    setNoteValue('');
    reset();
  };

  const handlePageSubmit = () => {
    if (isPages) {
       const p = parseFloat(pageValue);
       if (!isNaN(p)) {
         let prog = (p / track.target_count) * 100;
         prog = Math.min(100, Math.max(0, prog));
         submitSession(Math.floor(elapsedSeconds / 60), prog);
         return;
       }
    }
    submitSession(Math.floor(elapsedSeconds / 60), null);
  };
  
  const handleCancelPrompt = () => {
     if(confirm("Cancel logging this session entirely? The elapsed time will be reset.")) {
        setPrompting(false);
        reset();
     }
  };

  return (
    <div className={`bg-slate-100 p-4 rounded-xl flex items-center justify-between border border-slate-200 ${prompting ? 'flex-col sm:flex-row gap-4 items-stretch sm:items-center' : ''}`}>
      <div className="font-mono text-2xl font-bold text-slate-800 tracking-wider">
        {formatTime(elapsedSeconds)}
      </div>
      
      {prompting ? (
        <div className="flex flex-col sm:flex-row items-center gap-2 animate-in fade-in zoom-in duration-300 w-full sm:w-auto">
          {isPages && (
             <input 
               type="number" 
               autoFocus
               placeholder={`Page #`}
               value={pageValue}
               onChange={(e) => setPageValue(e.target.value)}
               className="w-full sm:w-24 px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
             />
          )}
          <input 
            type="text" 
            placeholder="Log note (optional)..."
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
          />
          <div className="flex w-full sm:w-auto gap-2">
            <button 
              onClick={handlePageSubmit}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition"
            >
               <Check size={16} /> Save
            </button>
            <button 
              onClick={handleCancelPrompt}
              disabled={loading}
              className="flex items-center justify-center px-2 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
              title="Discard session"
            >
               <X size={16} /> 
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          {!isRunning ? (
            <button 
              onClick={start} 
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm font-semibold text-sm"
            >
              <Play size={16} /> Start
            </button>
          ) : (
            <button 
              onClick={handleStopClick} 
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-sm font-semibold text-sm animate-pulse"
            >
              <Square size={16} /> Stop
            </button>
          )}
        </div>
      )}
    </div>
  );
}
