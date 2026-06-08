import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useJobs } from '../hooks/useJobs';
import { useNotes } from '../hooks/useNotes';
import { 
  Key, 
  Brain, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  Download, 
  Eye, 
  EyeOff, 
  BookOpen,
  Award,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function AIInsights() {
  const { getTracks, getAllSessions, getAllMilestones } = useSupabase();
  const { getJobs } = useJobs();
  const { getNotes } = useNotes();

  // Core data states
  const [tracks, setTracks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, synthesizer, resume, coach, settings

  // API Key state
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  // AI loading and output states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiError, setAiError] = useState('');

  // Resume prep form input
  const [userSkills, setUserSkills] = useState(() => localStorage.getItem('user_skills') || 'React, Tailwind CSS, JavaScript, Node.js, Supabase, Git');
  const [selectedJobId, setSelectedJobId] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTracks(),
      getAllSessions(),
      getAllMilestones(),
      getJobs(),
      getNotes()
    ]).then(([tracksData, sessionsData, milestonesData, jobsData, notesData]) => {
      setTracks(tracksData);
      setSessions(sessionsData);
      setMilestones(milestonesData);
      setJobs(jobsData);
      setNotes(notesData);
      if (jobsData.length > 0) {
        setSelectedJobId(jobsData[0].id.toString());
      }
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching data for AI page:", err);
      setLoading(false);
    });
  }, []);

  // Track ID to Track object lookup map
  const trackMap = useMemo(() => {
    const map = {};
    tracks.forEach(t => { map[t.id] = t; });
    return map;
  }, [tracks]);

  // Save API Key
  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 3000);
  };

  // Save Skills
  const handleSaveSkills = (e) => {
    e.preventDefault();
    localStorage.setItem('user_skills', userSkills);
    alert('Skills saved locally!');
  };

  // Helper: call Gemini REST API
  const callGemini = async (promptText) => {
    const key = localStorage.getItem('gemini_api_key');
    if (!key) {
      throw new Error("Missing Gemini API Key. Please save your API key in the configuration tab.");
    }
    
    setAiLoading(true);
    setAiError('');
    setAiResponse('');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: promptText
            }]
          }]
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error?.message || `API Error (Status ${response.status})`);
      }

      const resData = await response.json();
      const parsedText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!parsedText) {
        throw new Error("No response content generated. Please check your prompt or API key.");
      }

      setAiResponse(parsedText);
    } catch (err) {
      console.error("Gemini API error:", err);
      setAiError(err.message || "An unexpected error occurred while communicating with Gemini.");
    } finally {
      setAiLoading(false);
    }
  };

  // AI Feature 1: Study Synthesizer prompt
  const runStudySynthesizer = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Filter notes written in the past 30 days
    const recentNotes = notes.filter(n => new Date(n.created_at) >= thirtyDaysAgo);
    
    if (recentNotes.length === 0) {
      setAiError("You haven't logged any study notes in the past 30 days. Add some notes to your study sessions first!");
      return;
    }

    // Build prompt
    const notesString = recentNotes.map(n => {
      const trackName = n.tracks?.name || trackMap[n.track_id]?.name || 'Study Session';
      return `[Date: ${new Date(n.created_at).toLocaleDateString()}, Track: ${trackName}]: "${n.content}"`;
    }).join('\n\n');

    const prompt = `You are a Senior Learning OS Mentor. Below is a log of study notes written by the user over the past 30 days while learning.
Analyze these notes and compile a structured, high-value Markdown report consisting of:
1. **Key Concepts Mastered**: Synthesize what subjects/skills the user successfully studied and what concrete things they learned.
2. **Flagged Knowledge Gaps**: Search for keywords denoting struggle, confusion, roadblocks, or unanswered questions (e.g. "confused about", "stuck on", "hard to understand"). Summarize these areas.
3. **Recommended Next Actions & Resources**: Suggest 3 concrete topics they should learn next based on their notes, and what types of free resources/exercises they should do to solidfy their gaps.

Keep the tone highly professional, motivating, and direct.

USER STUDY LOGS:
${notesString}`;

    callGemini(prompt);
  };

  // AI Feature 2: Interview Prep prompt
  const runInterviewPrep = () => {
    const selectedJob = jobs.find(j => j.id.toString() === selectedJobId);
    if (!selectedJob) {
      setAiError("Please select a job application to prepare for.");
      return;
    }

    const prompt = `You are an elite Tech Interview Coach specializing in job placement. A user has a job interview coming up and wants customized preparation.

JOB APPLICATION:
Company: ${selectedJob.company}
Role: ${selectedJob.role}
Job Notes/Description: ${selectedJob.notes || 'No notes provided.'}

CANDIDATE ACTIVE SKILLS PROFILE:
${userSkills}

Based on this job profile and the candidate's skills, generate a professional Markdown interview preparation sheet:
1. **Tailored Elevator Pitch (30-Second Interview Opener)**: Write a brief, high-impact introductory script answering "Tell me about yourself" that connects the candidate's specific skills directly to this role at ${selectedJob.company}.
2. **Top 3 Custom Interview Questions**: Formulate 3 technical or behavioral questions that ${selectedJob.company} is highly likely to ask for this ${selectedJob.role} position.
3. **Targeted Talking Points (Answers)**: For each question, draft a clear outline of how the candidate should frame their answer (incorporating their listed skills) using the STAR method (Situation, Task, Action, Result). Include recommendations of specific keywords to drop.

Keep it highly custom, actionable, and specific to the job.`;

    callGemini(prompt);
  };

  // AI Feature 3: Habit Coach prompt
  const runHabitCoach = () => {
    // Collect the past 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Filter milestones and sessions
    const recentMilestones = milestones.filter(m => new Date(m.logged_at) >= thirtyDaysAgo);
    const recentSessions = sessions.filter(s => new Date(s.logged_at) >= thirtyDaysAgo);

    const wakeupMilestones = recentMilestones.filter(m => {
      const tName = trackMap[m.track_id]?.name || '';
      return tName.toLowerCase().includes('wake');
    });

    if (wakeupMilestones.length === 0 && recentSessions.length === 0) {
      setAiError("Not enough logs to run the coach. Please log some wake-up times and study hours first!");
      return;
    }

    // Prepare logs for the prompt
    let sleepLogs = wakeupMilestones.map(m => {
      return `Date: ${new Date(m.logged_at).toLocaleDateString()}, Wake-up: ${m.label}, Outcome: ${m.outcome}, Note: ${m.note || 'None'}`;
    }).join('\n');

    let studyLogs = recentSessions.map(s => {
      const tName = trackMap[s.track_id]?.name || 'Study';
      return `Date: ${new Date(s.logged_at).toLocaleDateString()}, Track: ${tName}, Duration: ${s.duration_minutes}m, Note: ${s.note || 'None'}`;
    }).join('\n');

    const prompt = `You are a supportive Cognitive Behavioral Habit Coach. Below is the past 30 days of wake-up logs and study logs logged by the user.

WAKE-UP HABIT LOGS (target is early wake-ups):
${sleepLogs || 'No wake-up habits logged in the past 30 days.'}

STUDY/LEARNING SESSION LOGS:
${studyLogs || 'No study sessions logged in the past 30 days.'}

Analyze this data and provide a constructive, supportive Markdown assessment containing:
1. **Sleep vs Study Correlation**: Highlight any clear trends (e.g. do early wake-up passes result in longer/more frequent study sessions? Does sleeping past target lead to lower study time or skipped days?).
2. **Consistency Review**: Evaluate their discipline, noting streaks, peak productivity blocks, or patterns of slips.
3. **3 Actionable Behavioral Prompts**: Give 3 practical, small adjustments they can make to their sleep schedule, study blocks, or night routine to improve their energy and productivity. Keep suggestions empathetic, scientific, and realistic.`;

    callGemini(prompt);
  };

  // Local Data Analytics calculations (Pure Javascript, 100% free, runs instantly)
  const localAnalytics = useMemo(() => {
    // 1. Peak Study Day of Week
    const weekdayMinutes = [0, 0, 0, 0, 0, 0, 0]; // Sun=0, Mon=1, ..., Sat=6
    sessions.forEach(s => {
      const day = new Date(s.logged_at).getDay();
      weekdayMinutes[day] += s.duration_minutes;
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let peakDayIdx = 0;
    let maxMin = 0;
    weekdayMinutes.forEach((min, idx) => {
      if (min > maxMin) {
        maxMin = min;
        peakDayIdx = idx;
      }
    });

    const peakStudyDay = maxMin > 0 ? { day: dayNames[peakDayIdx], hours: (maxMin / 60).toFixed(1) } : null;

    // 2. Correlation between Wake-Up Habit & Study Time
    // Map of Date -> Wakeup Outcome ('pass', 'fail')
    const wakeupDates = {};
    milestones.forEach(m => {
      const tName = trackMap[m.track_id]?.name || '';
      if (tName.toLowerCase().includes('wake')) {
        const dateStr = new Date(m.logged_at).toISOString().split('T')[0];
        wakeupDates[dateStr] = m.outcome;
      }
    });

    // Map of Date -> Study Minutes
    const studyDates = {};
    sessions.forEach(s => {
      const dateStr = new Date(s.logged_at).toISOString().split('T')[0];
      studyDates[dateStr] = (studyDates[dateStr] || 0) + s.duration_minutes;
    });

    let passStudySum = 0;
    let passDaysCount = 0;
    let failStudySum = 0;
    let failDaysCount = 0;

    Object.keys(wakeupDates).forEach(dateStr => {
      const outcome = wakeupDates[dateStr];
      const studyMins = studyDates[dateStr] || 0;
      if (outcome === 'pass') {
        passStudySum += studyMins;
        passDaysCount++;
      } else if (outcome === 'fail') {
        failStudySum += studyMins;
        failDaysCount++;
      }
    });

    const avgPassStudyHours = passDaysCount > 0 ? (passStudySum / passDaysCount / 60).toFixed(1) : null;
    const avgFailStudyHours = failDaysCount > 0 ? (failStudySum / failDaysCount / 60).toFixed(1) : null;

    let correlationText = '';
    if (avgPassStudyHours !== null && avgFailStudyHours !== null) {
      const diff = parseFloat(avgPassStudyHours) - parseFloat(avgFailStudyHours);
      if (diff > 0.1) {
        correlationText = `You studied ${diff.toFixed(1)} more hours on days you woke up early. Early rising makes you more productive! 🚀`;
      } else if (diff < -0.1) {
        correlationText = `Surprisingly, you studied ${Math.abs(diff).toFixed(1)} more hours on days you woke up late. Watch out for afternoon crashes! ☕`;
      } else {
        correlationText = `Your study time is similar regardless of wake-up time. Consistency is key! ⚖️`;
      }
    }

    // 3. Job search funnel conversion rates
    const totalApplied = jobs.length;
    const totalInterviews = jobs.filter(j => ['round1', 'round2', 'offer'].includes(j.status)).length;
    const totalOffers = jobs.filter(j => j.status === 'offer').length;

    const interviewRate = totalApplied > 0 ? Math.round((totalInterviews / totalApplied) * 100) : 0;
    const offerRate = totalApplied > 0 ? Math.round((totalOffers / totalApplied) * 100) : 0;

    return {
      peakStudyDay,
      avgPassStudyHours,
      avgFailStudyHours,
      correlationText,
      totalApplied,
      totalInterviews,
      totalOffers,
      interviewRate,
      offerRate
    };
  }, [sessions, milestones, jobs, trackMap]);

  // Export JSON Backup
  const handleExportBackup = async () => {
    try {
      const backupData = {
        exported_at: new Date().toISOString(),
        tracks,
        sessions,
        milestones,
        jobs,
        notes
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `personal-learning-os-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert("Failed to export backup: " + err.message);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-blue-600 animate-pulse" size={28} />
            AI & Personal Insights
          </h1>
          <p className="text-slate-500 font-medium mt-1">Get free summaries, interview practice, and data habits with Google Gemini.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-500 font-bold">crunching statistics...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Tabs Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 self-start w-full">
            <button
              id="tab-btn-analytics"
              onClick={() => { setActiveTab('analytics'); setAiResponse(''); setAiError(''); }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold tracking-tight transition ${
                activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <TrendingUp size={18} className="text-blue-600" />
              Data Analytics
            </button>
            <button
              id="tab-btn-synthesizer"
              onClick={() => { setActiveTab('synthesizer'); setAiResponse(''); setAiError(''); }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold tracking-tight transition ${
                activeTab === 'synthesizer' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <BookOpen size={18} className="text-emerald-600" />
              Study Synthesizer
            </button>
            <button
              id="tab-btn-resume"
              onClick={() => { setActiveTab('resume'); setAiResponse(''); setAiError(''); }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold tracking-tight transition ${
                activeTab === 'resume' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Briefcase size={18} className="text-purple-600" />
              Interview Prep
            </button>
            <button
              id="tab-btn-coach"
              onClick={() => { setActiveTab('coach'); setAiResponse(''); setAiError(''); }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold tracking-tight transition ${
                activeTab === 'coach' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Clock size={18} className="text-amber-500" />
              Cognitive Coach
            </button>
            <div className="h-px bg-slate-200 my-2"></div>
            <button
              id="tab-btn-settings"
              onClick={() => { setActiveTab('settings'); setAiResponse(''); setAiError(''); }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold tracking-tight transition ${
                activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Key size={18} className="text-slate-600" />
              Keys & Backup
            </button>
          </div>

          {/* Active View Container */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 1. DATA ANALYTICS VIEW */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-extrabold text-slate-950 tracking-tight mb-2">Automated Insights Dashboard</h2>
                  <p className="text-slate-500 text-sm font-medium">Mathematical trends extracted directly from your offline databases. Completely automatic.</p>
                  
                  {/* Grid Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                    
                    {/* Sleep vs Study hours correlation */}
                    <div className="bg-gradient-to-br from-indigo-50/50 to-white p-5 rounded-2xl border border-indigo-100">
                      <h3 className="font-extrabold text-indigo-950 text-sm tracking-tight mb-3 flex items-center gap-1.5">
                        <Clock size={16} className="text-indigo-600" />
                        Sleep vs Productivity Correlation
                      </h3>
                      
                      {localAnalytics.avgPassStudyHours || localAnalytics.avgFailStudyHours ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                            <span>Woke up Early:</span>
                            <span className="font-black text-indigo-700">{localAnalytics.avgPassStudyHours || '0'} hrs study avg</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                            <span>Slept Past Target:</span>
                            <span className="font-black text-slate-700">{localAnalytics.avgFailStudyHours || '0'} hrs study avg</span>
                          </div>
                          {localAnalytics.correlationText && (
                            <p className="text-xs text-indigo-900 font-bold bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 mt-2">
                              {localAnalytics.correlationText}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No corresponding wake-up and study logs found. Track both to calculate sleep correlation.</p>
                      )}
                    </div>

                    {/* Peak Study Day */}
                    <div className="bg-gradient-to-br from-emerald-50/50 to-white p-5 rounded-2xl border border-emerald-100">
                      <h3 className="font-extrabold text-emerald-950 text-sm tracking-tight mb-3 flex items-center gap-1.5">
                        <TrendingUp size={16} className="text-emerald-600" />
                        Peak Study Patterns
                      </h3>

                      {localAnalytics.peakStudyDay ? (
                        <div>
                          <p className="text-xs font-semibold text-slate-600">You study most consistently on:</p>
                          <p className="text-lg font-black text-slate-900 mt-1">{localAnalytics.peakStudyDay.day}</p>
                          <p className="text-xs text-emerald-700 font-bold mt-2">Total active focus logged on this day: {localAnalytics.peakStudyDay.hours} hours.</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No study sessions logged yet. Head to Tracks to log study sessions.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Search Funnel Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                    <Briefcase className="text-sky-600" size={18} />
                    Job Search Funnel Conversion Rates
                  </h3>

                  {localAnalytics.totalApplied > 0 ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Applied</span>
                        <span className="text-xl font-black text-slate-800">{localAnalytics.totalApplied}</span>
                      </div>
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-500 block mb-0.5">Interviews</span>
                        <span className="text-xl font-black text-indigo-700">{localAnalytics.totalInterviews}</span>
                        <span className="text-[9px] font-bold text-indigo-600 block mt-1">({localAnalytics.interviewRate}% rate)</span>
                      </div>
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-600 block mb-0.5">Offers</span>
                        <span className="text-xl font-black text-emerald-800">{localAnalytics.totalOffers}</span>
                        <span className="text-[9px] font-bold text-emerald-700 block mt-1">({localAnalytics.offerRate}% conversion)</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No job applications logged yet. Log your job hunt details on the Jobs tab.</p>
                  )}
                </div>
              </div>
            )}

            {/* 2. STUDY SYNTHESIZER VIEW */}
            {activeTab === 'synthesizer' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
                    <BookOpen className="text-emerald-600" size={22} />
                    AI Study Synthesizer
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Claude/Gemini reads through all learning notes you saved over the past 30 days, builds summaries, and flags potential knowledge gaps.
                  </p>
                </div>

                {!localStorage.getItem('gemini_api_key') ? (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <h4 className="font-extrabold text-sm">Gemini API Key Required</h4>
                      <p className="text-xs mt-1 leading-relaxed">
                        To keep this tool 100% free, we execute queries using your own free API Key. Head to the <strong>Keys & Backup</strong> tab to set it up.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      disabled={aiLoading}
                      onClick={runStudySynthesizer}
                      className="px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <Sparkles size={16} />
                      {aiLoading ? 'Synthesizing logs...' : 'Analyze Last 30 Days of Study'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. RESUME & INTERVIEW PREP VIEW */}
            {activeTab === 'resume' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
                    <Briefcase className="text-purple-600" size={22} />
                    AI Resume & Interview Prep
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Generates a customized elevator pitch and the top 3 interview questions specifically for one of your job applications.
                  </p>
                </div>

                {!localStorage.getItem('gemini_api_key') ? (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <h4 className="font-extrabold text-sm">Gemini API Key Required</h4>
                      <p className="text-xs mt-1 leading-relaxed">
                        To keep this tool 100% free, we execute queries using your own free API Key. Head to the <strong>Keys & Backup</strong> tab to set it up.
                      </p>
                    </div>
                  </div>
                ) : jobs.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Please add job applications in your Job Tracker before generating preparation sheets.</p>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); runInterviewPrep(); }} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Job Application</label>
                      <select 
                        value={selectedJobId} 
                        onChange={(e) => setSelectedJobId(e.target.value)} 
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-blue-500 bg-white"
                      >
                        {jobs.map(j => (
                          <option key={j.id} value={j.id}>{j.company} — {j.role}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Your Core Skills (Comma Separated)</label>
                      <textarea
                        rows={2}
                        value={userSkills}
                        onChange={(e) => setUserSkills(e.target.value)}
                        placeholder="e.g. React, JavaScript, SQL, CSS"
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={aiLoading}
                        className="px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        <Sparkles size={16} />
                        {aiLoading ? 'Generating prep notes...' : 'Generate Interview Prep Sheet'}
                      </button>
                      <button 
                        type="button" 
                        onClick={handleSaveSkills} 
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
                      >
                        Save Skills
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 4. COGNITIVE HABIT COACH VIEW */}
            {activeTab === 'coach' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
                    <Brain className="text-amber-500" size={22} />
                    AI Cognitive Habit Coach
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Analyzes your logged study times versus wake-up streaks to coach you on planning your calendar and avoiding energy crashes.
                  </p>
                </div>

                {!localStorage.getItem('gemini_api_key') ? (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <h4 className="font-extrabold text-sm">Gemini API Key Required</h4>
                      <p className="text-xs mt-1 leading-relaxed">
                        To keep this tool 100% free, we execute queries using your own free API Key. Head to the <strong>Keys & Backup</strong> tab to set it up.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      disabled={aiLoading}
                      onClick={runHabitCoach}
                      className="px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <Sparkles size={16} />
                      {aiLoading ? 'Connecting to Coach...' : 'Run Cognitive Habit Analysis'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. SETTINGS & BACKUP VIEW */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                
                {/* Key Config */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2 mb-2">
                    <Key size={22} className="text-slate-700" />
                    Google Gemini API Settings
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mb-5">
                    We use Google's Gemini API which provides a completely free tier. Obtain a free key from the official 
                    <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline mx-1">Google AI Studio</a>.
                  </p>

                  <form onSubmit={handleSaveKey} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Gemini API Key</label>
                      <div className="relative flex items-center">
                        <input
                          type={showKey ? "text" : "password"}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full p-2.5 pr-12 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 transition"
                        >
                          {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition active:scale-95 flex items-center gap-1.5"
                    >
                      Save Key Locally
                    </button>
                    {keySaved && <p className="text-xs font-bold text-green-600 animate-pulse">Key successfully updated in local browser!</p>}
                  </form>
                </div>

                {/* Exporter Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2 mb-2">
                    <Download size={22} className="text-slate-700" />
                    Data Export & Backup
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mb-5">
                    Download all of your database records (tracks, logs, milestones, job funnel, notes) in a single portable JSON file.
                  </p>

                  <button
                    onClick={handleExportBackup}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Download size={16} />
                    Download JSON Backup
                  </button>
                </div>

              </div>
            )}

            {/* AI Query output display container */}
            {activeTab !== 'analytics' && activeTab !== 'settings' && (aiResponse || aiLoading || aiError) && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 transition-all">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-700 tracking-tight uppercase">Coach / Assistant Output</h3>
                  {aiLoading && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                      <div className="animate-spin h-3.5 w-3.5 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
                      Generating Content...
                    </div>
                  )}
                </div>

                {aiError && (
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold leading-relaxed flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{aiError}</span>
                  </div>
                )}

                {aiResponse && (
                  <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium font-sans">
                    {/* Render markdown headlines nicely */}
                    {aiResponse.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={idx} className="text-sm font-black text-slate-950 mt-4 mb-2 tracking-tight">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('## ')) {
                        return <h3 key={idx} className="text-base font-black text-slate-950 mt-5 mb-2.5 tracking-tight border-b border-slate-200/60 pb-1">{line.replace('## ', '')}</h3>;
                      }
                      if (line.startsWith('# ')) {
                        return <h2 key={idx} className="text-lg font-black text-slate-950 mt-6 mb-3 tracking-tight">{line.replace('# ', '')}</h2>;
                      }
                      return <p key={idx} className="mb-2">{line}</p>;
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
