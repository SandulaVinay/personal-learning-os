import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/shared/AuthProvider';
import { useNotes } from '../hooks/useNotes';
import { useSupabase } from '../hooks/useSupabase';
import { useJobs } from '../hooks/useJobs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import NoteCard from '../components/notes/NoteCard';
import TrackCard from '../components/tracks/TrackCard';
import VelocityChart from '../components/dashboard/VelocityChart';
import NudgeCard from '../components/dashboard/NudgeCard';
import JobSummaryCard from '../components/dashboard/JobSummaryCard';
import ActivityCalendar from '../components/dashboard/ActivityCalendar';
import DailyQuoteCard from '../components/dashboard/DailyQuoteCard';

export default function Home() {
  const { user } = useAuth();
  
  const { getHighPriorityNotes } = useNotes();
  const { getTracks, getAllSessions, getAllMilestones } = useSupabase();
  const { getJobs } = useJobs();
  
  const [highNotes, setHighNotes] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [jobs, setJobs] = useState([]);
  
  // Dashboard category filter: all, reading, learning, jobs, wakeup, milestone
  const [activeFilter, setActiveFilter] = useState('all');

  // Month navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    getHighPriorityNotes().then(setHighNotes);
    getTracks().then(setTracks);
    getAllSessions().then(setSessions);
    getAllMilestones().then(setMilestones);
    getJobs().then(setJobs);
  }, []);

  const prevMonth = () => {
    setCurrentMonthDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const nextMonth = () => {
    setCurrentMonthDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const monthLabel = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Track map for lookup
  const trackMap = useMemo(() => {
    const map = {};
    tracks.forEach(t => { map[t.id] = t; });
    return map;
  }, [tracks]);

  // Filtered datasets by selected month & year
  const sessionsInMonth = useMemo(() => {
    const selectedYear = currentMonthDate.getFullYear();
    const selectedMonth = currentMonthDate.getMonth();
    return sessions.filter(s => {
      const d = new Date(s.logged_at);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [sessions, currentMonthDate]);

  const milestonesInMonth = useMemo(() => {
    const selectedYear = currentMonthDate.getFullYear();
    const selectedMonth = currentMonthDate.getMonth();
    return milestones.filter(m => {
      const d = new Date(m.logged_at);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [milestones, currentMonthDate]);

  const jobsInMonth = useMemo(() => {
    const selectedYear = currentMonthDate.getFullYear();
    const selectedMonth = currentMonthDate.getMonth();
    return jobs.filter(j => {
      const d = new Date(j.applied_at);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [jobs, currentMonthDate]);

  // Filtered tracks list
  const filteredTracks = useMemo(() => {
    if (activeFilter === 'all') return tracks;
    if (activeFilter === 'reading') return tracks.filter(t => t.type === 'session' && t.target_count);
    if (activeFilter === 'learning') return tracks.filter(t => t.type === 'session' && !t.target_count);
    if (activeFilter === 'jobs') return [];
    if (activeFilter === 'wakeup') return tracks.filter(t => t.type === 'milestone' && t.name.toLowerCase().includes('wake'));
    if (activeFilter === 'milestone') return tracks.filter(t => t.type === 'milestone' && !t.name.toLowerCase().includes('wake'));
    return tracks;
  }, [tracks, activeFilter]);

  // Filtered sessions for the VelocityChart
  const filteredSessionsForChart = useMemo(() => {
    if (activeFilter === 'all') return sessionsInMonth;
    if (activeFilter === 'reading') return sessionsInMonth.filter(s => trackMap[s.track_id]?.type === 'session' && trackMap[s.track_id]?.target_count);
    if (activeFilter === 'learning') return sessionsInMonth.filter(s => trackMap[s.track_id]?.type === 'session' && !trackMap[s.track_id]?.target_count);
    return [];
  }, [sessionsInMonth, trackMap, activeFilter]);

  // Filtered logs for the ActivityCalendar
  const filteredLogsForCalendar = useMemo(() => {
    if (activeFilter === 'all') return sessionsInMonth;
    if (activeFilter === 'reading') return sessionsInMonth.filter(s => trackMap[s.track_id]?.type === 'session' && trackMap[s.track_id]?.target_count);
    if (activeFilter === 'learning') return sessionsInMonth.filter(s => trackMap[s.track_id]?.type === 'session' && !trackMap[s.track_id]?.target_count);
    if (activeFilter === 'wakeup') {
      return milestonesInMonth
        .filter(m => trackMap[m.track_id]?.name.toLowerCase().includes('wake'))
        .map(m => ({ logged_at: m.logged_at }));
    }
    if (activeFilter === 'milestone') {
      return milestonesInMonth
        .filter(m => !trackMap[m.track_id]?.name.toLowerCase().includes('wake'))
        .map(m => ({ logged_at: m.logged_at }));
    }
    return [];
  }, [sessionsInMonth, milestonesInMonth, trackMap, activeFilter]);

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">Welcome back, {user?.email}</p>
         </div>

         {/* Month Navigation Control */}
         <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm self-start md:self-center">
            <button 
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            
            <span className="px-3 text-xs font-extrabold text-slate-800 tracking-tight min-w-[110px] text-center">
              {monthLabel}
            </span>

            <button 
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition"
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
         </div>
      </div>

      <DailyQuoteCard />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'all', label: 'All Logs' },
          { id: 'reading', label: 'Reading 📚' },
          { id: 'learning', label: 'Learning ⚡' },
          { id: 'jobs', label: 'Jobs 💼' },
          { id: 'wakeup', label: 'Wake-up ⏰' },
          { id: 'milestone', label: 'Milestones 🎯' }
        ].map(filter => (
          <button
            key={filter.id}
            id={`dashboard-filter-${filter.id}`}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeFilter === filter.id 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      {/* Top Banner: Notes Spaced Repetition */}
      {highNotes.length > 0 && (activeFilter === 'all' || activeFilter === 'learning' || activeFilter === 'reading') && (
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
            
            {/* Velocity Chart */}
            {(activeFilter === 'all' || activeFilter === 'reading' || activeFilter === 'learning') && (
               <VelocityChart sessions={filteredSessionsForChart} />
            )}

            {/* Quick dashboard helper */}
            {(activeFilter === 'wakeup' || activeFilter === 'milestone') && (
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-extrabold text-slate-900 mb-2">Habit Overview</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                     You are viewing logs for the <strong>{activeFilter === 'wakeup' ? 'Wake-up Habit' : 'Milestones'}</strong> category. 
                     Log new accomplishments by clicking 'Log Work' on active habit cards below, or check your monthly stats in the History page.
                  </p>
               </div>
            )}

            {/* Jobs list */}
            {activeFilter === 'jobs' && (
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center mb-2">
                     <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Recent Job Applications ({monthLabel})</h3>
                     <Link to="/jobs" className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition">Manage Jobs →</Link>
                  </div>
                  {jobsInMonth.length > 0 ? (
                     <div className="divide-y divide-slate-100">
                        {jobsInMonth.slice(0, 5).map(job => (
                           <div key={job.id} className="py-3.5 flex justify-between items-center gap-4">
                              <div>
                                 <h4 className="font-bold text-slate-900 text-sm">{job.company}</h4>
                                 <p className="text-xs text-slate-500 font-medium">{job.role}</p>
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-md">
                                 {job.status}
                              </span>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-xs text-slate-500 italic">No job applications logged in {monthLabel}.</p>
                  )}
               </div>
            )}

            {(activeFilter === 'all' || activeFilter === 'reading' || activeFilter === 'learning') && (
               <NudgeCard tracks={filteredTracks} sessions={sessionsInMonth} />
            )}
            
            {/* If there are no tracks, prompt the user */}
            {filteredTracks.length === 0 && activeFilter !== 'jobs' && (
               <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-xl text-center">
                 <h3 className="font-bold text-slate-700 text-lg mb-2">Your slate is clean</h3>
                 <p className="text-slate-500 text-sm mb-4">You have no tracks running in this category right now. Ready to start?</p>
                 <Link to="/tracks" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Create a Track</Link>
               </div>
            )}
         </div>
         
         {/* Right Side (Col span 1) */}
         <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Activity calendar */}
            {activeFilter !== 'jobs' && (
               <ActivityCalendar sessions={filteredLogsForCalendar} currentMonthDate={currentMonthDate} />
            )}

            {/* Job summary card */}
            {(activeFilter === 'all' || activeFilter === 'jobs') && (
               <JobSummaryCard jobs={jobsInMonth} />
            )}
            
            {filteredTracks.length > 0 && (
               <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                 <h3 className="font-extrabold text-blue-900 mb-2">Track Overview</h3>
                 <p className="text-sm text-blue-800 font-medium">You are actively managing <strong>{filteredTracks.length}</strong> parallel objectives in this category.</p>
                 <Link to="/tracks" className="inline-block mt-4 text-xs font-bold bg-blue-200 text-blue-900 px-3 py-1.5 rounded-md hover:bg-blue-300 transition">Jump to Tracks →</Link>
               </div>
            )}
         </div>
         
      </div>

      {/* Render active tracks */}
      {filteredTracks.length > 0 && (
        <>
          <h2 className="text-xl font-extrabold text-slate-800 mb-5 tracking-tight border-b border-slate-200 pb-3">Active Tracks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
             {filteredTracks.map(t => <TrackCard key={t.id} track={t} />)}
          </div>
        </>
      )}

    </div>
  );
}
