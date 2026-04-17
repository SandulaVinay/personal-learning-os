import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/shared/AuthProvider';
import { useNotes } from '../hooks/useNotes';
import { useSupabase } from '../hooks/useSupabase';
import { useJobs } from '../hooks/useJobs';

import NoteCard from '../components/notes/NoteCard';
import TrackCard from '../components/tracks/TrackCard';
import VelocityChart from '../components/dashboard/VelocityChart';
import NudgeCard from '../components/dashboard/NudgeCard';
import JobSummaryCard from '../components/dashboard/JobSummaryCard';
import ActivityCalendar from '../components/dashboard/ActivityCalendar';

export default function Home() {
  const { user } = useAuth();
  
  const { getHighPriorityNotes } = useNotes();
  const { getTracks, getAllSessions } = useSupabase();
  const { getJobs } = useJobs();
  
  const [highNotes, setHighNotes] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getHighPriorityNotes().then(setHighNotes);
    getTracks().then(setTracks);
    getAllSessions().then(setSessions);
    getJobs().then(setJobs);
  }, []);

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8">
         <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
         <p className="text-slate-500 font-medium mt-1">Welcome back, {user?.email}</p>
      </div>
      
      {/* Top Banner: Notes Spaced Repetition */}
      {highNotes.length > 0 && (
         <div className="mb-8 bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-md ring-1 ring-slate-800 relative overflow-hidden">
           {/* Decorator background */}
           <div className="absolute -top-10 -right-10 text-9xl opacity-10">📝</div>
           
           <h2 className="text-base font-bold text-blue-400 mb-5 flex items-center gap-2">
              <span className="text-xl">🔥</span> Spaced Repetition: High Priority Notes
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
             {highNotes.map(n => <NoteCard key={n.id} note={n} minimize={true} />)}
           </div>
         </div>
      )}
      
      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
         
         {/* Left Side (Col span 2) */}
         <div className="lg:col-span-2 flex flex-col gap-6">
            <VelocityChart sessions={sessions} />
            <NudgeCard tracks={tracks} sessions={sessions} />
            
            {/* If there are no tracks, prompt the user */}
            {tracks.length === 0 && (
               <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-xl text-center">
                 <h3 className="font-bold text-slate-700 text-lg mb-2">Your slate is clean</h3>
                 <p className="text-slate-500 text-sm mb-4">You have no tracks running right now. Ready to start learning?</p>
                 <Link to="/tracks" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Create a Track</Link>
               </div>
            )}
         </div>
         
         {/* Right Side (Col span 1) */}
         <div className="lg:col-span-1 flex flex-col gap-6">
            <ActivityCalendar sessions={sessions} />
            <JobSummaryCard jobs={jobs} />
            
            {tracks.length > 0 && (
               <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                 <h3 className="font-extrabold text-blue-900 mb-2">Track Overview</h3>
                 <p className="text-sm text-blue-800 font-medium">You are actively managing <strong>{tracks.length}</strong> parallel learning objectives.</p>
                 <Link to="/tracks" className="inline-block mt-4 text-xs font-bold bg-blue-200 text-blue-900 px-3 py-1.5 rounded-md hover:bg-blue-300 transition">Jump to Tracks →</Link>
              </div>
            )}
         </div>
         
      </div>

      {/* Render all full tracks on the dashboard directly as requested by the initial spec */}
      {tracks.length > 0 && (
        <>
          <h2 className="text-xl font-extrabold text-slate-800 mb-5 tracking-tight border-b border-slate-200 pb-3">Active Tracks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
             {tracks.map(t => <TrackCard key={t.id} track={t} />)}
          </div>
        </>
      )}

    </div>
  );
}
