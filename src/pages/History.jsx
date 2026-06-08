import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useJobs } from '../hooks/useJobs';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Briefcase, 
  Clock, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar
} from 'lucide-react';

export default function History() {
  const { getTracks, getAllSessions, getAllMilestones } = useSupabase();
  const { getJobs } = useJobs();

  // State
  const [tracks, setTracks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Month navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Filter state
  const [activeFilter, setActiveFilter] = useState('all'); // all, reading, learning, jobs, wakeup, milestone
  const [timeRange, setTimeRange] = useState('monthly'); // monthly, all-time
  const [selectedTrackId, setSelectedTrackId] = useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTracks(),
      getAllSessions(),
      getAllMilestones(),
      getJobs()
    ]).then(([tracksData, sessionsData, milestonesData, jobsData]) => {
      setTracks(tracksData);
      setSessions(sessionsData);
      setMilestones(milestonesData);
      setJobs(jobsData);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching history data:", err);
      setLoading(false);
    });
  }, []);

  // Track map for easy lookup
  const trackMap = useMemo(() => {
    const map = {};
    tracks.forEach(t => { map[t.id] = t; });
    return map;
  }, [tracks]);

  // Navigate months
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

  // Process activities & calculate session progress deltas chronologically
  const processedSessions = useMemo(() => {
    if (sessions.length === 0 || tracks.length === 0) return [];

    // Group sessions by track_id
    const sessionsByTrack = {};
    sessions.forEach(s => {
      if (!sessionsByTrack[s.track_id]) {
        sessionsByTrack[s.track_id] = [];
      }
      sessionsByTrack[s.track_id].push(s);
    });

    const results = [];

    // For each track, sort sessions chronologically to compute delta progress
    Object.keys(sessionsByTrack).forEach(trackId => {
      const trackSessions = [...sessionsByTrack[trackId]].sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at));
      const track = trackMap[trackId];
      if (!track) return;

      const isPages = !!track.target_count;
      let prevPercent = 0;

      trackSessions.forEach(session => {
        let pageDelta = 0;
        let percentDelta = 0;
        let pageRange = null;

        if (session.progress_percent !== null) {
          if (isPages) {
            const prevPage = Math.round((prevPercent / 100) * track.target_count);
            const currPage = Math.round((session.progress_percent / 100) * track.target_count);
            pageDelta = Math.max(0, currPage - prevPage);
            pageRange = { from: prevPage, to: currPage };
          } else {
            percentDelta = Math.max(0, session.progress_percent - prevPercent);
          }
          prevPercent = session.progress_percent;
        }

        results.push({
          ...session,
          pageDelta,
          percentDelta,
          pageRange,
          isPages,
          trackName: track.name
        });
      });
    });

    return results;
  }, [sessions, tracks, trackMap]);

  // Unify all activities into a single timeline
  const allActivities = useMemo(() => {
    const list = [];

    // 1. Add Sessions (Reading & Learning)
    processedSessions.forEach(s => {
      const activityType = s.isPages ? 'reading' : 'learning';
      list.push({
        id: `session-${s.id}`,
        type: activityType,
        date: new Date(s.logged_at),
        title: s.trackName,
        details: s.isPages 
          ? `Read ${s.pageDelta} pages (${Math.round(s.progress_percent)}% total, reached p. ${s.pageRange?.to})`
          : `Studied for ${s.duration_minutes} mins (reached ${s.progress_percent !== null ? Math.round(s.progress_percent) : 0}%)`,
        durationMinutes: s.duration_minutes,
        pageDelta: s.pageDelta,
        note: s.note,
        raw: s
      });
    });

    // 2. Add Milestones (Wake-up & general Milestones)
    milestones.forEach(m => {
      const track = trackMap[m.track_id];
      const trackName = track ? track.name : 'Milestone';
      const isWakeUp = trackName.toLowerCase().includes('wake');
      
      list.push({
        id: `milestone-${m.id}`,
        type: isWakeUp ? 'wakeup' : 'milestone',
        date: new Date(m.logged_at),
        title: trackName,
        details: m.label,
        outcome: m.outcome, // pass, fail, pending
        note: m.note,
        raw: m
      });
    });

    // 3. Add Job Applications
    jobs.forEach(j => {
      list.push({
        id: `job-${j.id}`,
        type: 'jobs',
        date: new Date(j.applied_at),
        title: j.company,
        details: `Applied for: ${j.role}`,
        status: j.status,
        note: j.notes,
        raw: j
      });
    });

    // Sort by date descending
    return list.sort((a, b) => b.date - a.date);
  }, [processedSessions, milestones, jobs, trackMap]);

  // Filter activities based on date selection and track selection
  const filteredActivities = useMemo(() => {
    let list = allActivities;

    // 1. Filter by Track if a specific track is selected
    if (selectedTrackId !== 'all') {
      const trackIdNum = Number(selectedTrackId);
      list = list.filter(act => act.raw && act.raw.track_id === trackIdNum);
    }

    // 2. Filter by Month (only if timeRange is 'monthly')
    if (timeRange === 'monthly') {
      const selectedYear = currentMonthDate.getFullYear();
      const selectedMonth = currentMonthDate.getMonth();
      list = list.filter(act => {
        return act.date.getFullYear() === selectedYear && act.date.getMonth() === selectedMonth;
      });
    }

    // 3. Filter by Active Category Filter Tab
    if (activeFilter === 'all') return list;
    return list.filter(act => act.type === activeFilter);
  }, [allActivities, currentMonthDate, activeFilter, timeRange, selectedTrackId]);

  // Calculate stats for the selected filters (month vs lifetime, track etc.)
  const monthStats = useMemo(() => {
    let list = allActivities;

    // Filter by Track
    if (selectedTrackId !== 'all') {
      const trackIdNum = Number(selectedTrackId);
      list = list.filter(act => act.raw && act.raw.track_id === trackIdNum);
    }

    // Filter by Month (if monthly view active)
    if (timeRange === 'monthly') {
      const selectedYear = currentMonthDate.getFullYear();
      const selectedMonth = currentMonthDate.getMonth();
      list = list.filter(act => {
        return act.date.getFullYear() === selectedYear && act.date.getMonth() === selectedMonth;
      });
    }

    // Reading
    const readingActs = list.filter(a => a.type === 'reading');
    const totalPagesRead = readingActs.reduce((acc, curr) => acc + (curr.pageDelta || 0), 0);
    const readingHours = readingActs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) / 60;

    // Learning
    const learningActs = list.filter(a => a.type === 'learning');
    const learningHours = learningActs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) / 60;

    // Jobs
    const jobActs = list.filter(a => a.type === 'jobs');
    const jobsApplied = jobActs.length;
    const offersReceived = jobActs.filter(a => a.status === 'offer').length;

    // Wake-up
    const wakeupActs = list.filter(a => a.type === 'wakeup');
    const wakeupsLogged = wakeupActs.length;
    const successfulWakeups = wakeupActs.filter(a => a.outcome === 'pass').length;
    const wakeupSuccessRate = wakeupsLogged > 0 ? Math.round((successfulWakeups / wakeupsLogged) * 100) : null;

    return {
      totalPagesRead,
      readingHours: readingHours.toFixed(1),
      learningHours: learningHours.toFixed(1),
      jobsApplied,
      offersReceived,
      wakeupsLogged,
      wakeupSuccessRate
    };
  }, [allActivities, currentMonthDate, timeRange, selectedTrackId]);

  const monthLabel = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get status color for jobs
  const getJobStatusBadge = (status) => {
    switch (status) {
      case 'offer': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'round1': case 'round2': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };

  // Get outcome styling for milestones / wake-up
  const getOutcomeBadge = (outcome) => {
    switch (outcome) {
      case 'pass': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'fail': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'reading': return <BookOpen className="text-emerald-600" size={18} />;
      case 'learning': return <TrendingUp className="text-indigo-600" size={18} />;
      case 'wakeup': return <Clock className="text-amber-500" size={18} />;
      case 'jobs': return <Briefcase className="text-sky-600" size={18} />;
      default: return <Award className="text-purple-600" size={18} />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Header with Date Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Activity History</h1>
          <p className="text-slate-500 font-medium mt-1">Review and filter your learning and habit logs.</p>
        </div>

        {/* Date Mode Toggle & Month Navigator */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          {/* Monthly / All-Time Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-3 py-1.5 rounded-lg transition ${timeRange === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeRange('all-time')}
              className={`px-3 py-1.5 rounded-lg transition ${timeRange === 'all-time' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              All Time
            </button>
          </div>

          {/* Month Navigation (Only show if timeRange === 'monthly') */}
          {timeRange === 'monthly' && (
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button 
                id="prev-month-btn"
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
                id="next-month-btn"
                onClick={nextMonth}
                className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition"
                title="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-500 font-bold">Assembling history timeline...</span>
        </div>
      ) : (
        <>
          {/* Monthly Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Reading Stat */}
            <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100/80 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 block mb-1">Reading</span>
                <p className="text-2xl font-black text-slate-900">{monthStats.totalPagesRead} <span className="text-xs font-bold text-slate-500">pages</span></p>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Spent {monthStats.readingHours} hours in total</p>
            </div>

            {/* Learning Stat */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100/80 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 block mb-1">Learning</span>
                <p className="text-2xl font-black text-slate-900">{monthStats.learningHours} <span className="text-xs font-bold text-slate-500">hours</span></p>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Active skill tracking</p>
            </div>

            {/* Jobs Stat */}
            <div className="bg-gradient-to-br from-sky-50 to-white p-5 rounded-2xl border border-sky-100/80 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 block mb-1">Job Search</span>
                <p className="text-2xl font-black text-slate-900">{monthStats.jobsApplied} <span className="text-xs font-bold text-slate-500">applied</span></p>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">{monthStats.offersReceived} offer{monthStats.offersReceived !== 1 ? 's' : ''} received</p>
            </div>

            {/* Wake-up Stat */}
            <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-100/80 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Wake-up Habit</span>
                <p className="text-2xl font-black text-slate-900">
                  {monthStats.wakeupSuccessRate !== null ? `${monthStats.wakeupSuccessRate}%` : '--'}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {monthStats.wakeupsLogged} day{monthStats.wakeupsLogged !== 1 ? 's' : ''} logged this month
              </p>
            </div>
          </div>

          {/* Filters Bar: Category tabs & Track dropdown select */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
             {/* Category Filter Tabs */}
             <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-xl w-fit">
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
                   id={`filter-btn-${filter.id}`}
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

             {/* Track Dropdown Filter */}
             <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Book/Track:</label>
                <select
                  value={selectedTrackId}
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm min-w-[180px]"
                >
                   <option value="all">All Books & Tracks</option>
                   {tracks.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                   ))}
                </select>
             </div>
          </div>

          {/* Activity Timeline List */}
          {filteredActivities.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 border-dashed rounded-2xl shadow-sm">
              <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-800">No logs found</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                No active records matched your selections for <strong>{monthLabel}</strong>. Try selecting a different month or filter.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
              {filteredActivities.map(activity => (
                <div 
                  key={activity.id} 
                  className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-50/50 transition duration-150 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Circle Icon Badge */}
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    {/* Title & Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-[15px]">{activity.title}</h4>
                        
                        {/* Type specific badges */}
                        {activity.type === 'jobs' && (
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider border ${getJobStatusBadge(activity.status)}`}>
                            {activity.status}
                          </span>
                        )}

                        {(activity.type === 'wakeup' || activity.type === 'milestone') && (
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider border ${getOutcomeBadge(activity.outcome)}`}>
                            {activity.outcome}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600 text-sm mt-1 font-medium leading-relaxed">
                        {activity.details}
                      </p>

                      {activity.note && (
                        <p className="text-slate-500 text-xs italic mt-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg font-medium">
                          "{activity.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date Badge */}
                  <div className="md:text-right flex-shrink-0 flex items-center md:flex-col md:items-end justify-between md:justify-start gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-2 py-1 rounded md:bg-transparent md:border-0 md:p-0">
                      {activity.date.toLocaleDateString(undefined, { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {activity.date.toLocaleTimeString(undefined, { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
