import { useState, useEffect } from 'react';
import { useJobs } from '../hooks/useJobs';
import JobForm from '../components/jobs/JobForm';
import JobList from '../components/jobs/JobList';
import JobFunnelChart from '../components/jobs/JobFunnelChart';

export default function Jobs() {
  const { getJobs } = useJobs();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobs().then(res => {
      setJobs(res);
      setLoading(false);
    });
  }, []);

  const handleJobAdded = (newJob) => setJobs([newJob, ...jobs]);
  const handleJobUpdated = (updatedJob) => {
    setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Tracker</h1>
        <p className="text-slate-500 mt-1.5 font-medium">Treat the search like a precision funnel.</p>
      </div>

      {loading ? (
         <div className="text-center py-20 text-slate-400 font-medium">Loading funnel...</div>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               <JobForm onJobAdded={handleJobAdded} />
               <JobList jobs={jobs} onJobUpdated={handleJobUpdated} />
            </div>
            
            <div className="lg:col-span-1">
               <JobFunnelChart jobs={jobs} />
            </div>
         </div>
      )}
    </div>
  )
}
