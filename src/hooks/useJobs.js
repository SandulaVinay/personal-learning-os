import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../components/shared/AuthProvider';

export function useJobs() {
  const { user } = useAuth();

  const getJobs = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('applied_at', { ascending: false });
    if (error) console.error('Error fetching jobs:', error);
    return data || [];
  };

  const createJob = async (job) => {
    if (!user) throw new Error('Not logged in');
    const { data, error } = await supabase
      .from('jobs')
      .insert([{ ...job, user_id: user.id }])
      .select();
    if (error) throw error;
    return data[0];
  };

  const updateJob = async (id, updatesOrStatus, notes) => {
    if (!user) throw new Error('Not logged in');
    
    let payload = {};
    if (typeof updatesOrStatus === 'string') {
      payload = { status: updatesOrStatus, updated_at: new Date().toISOString() };
      if (notes !== undefined) payload.notes = notes;
    } else {
      payload = { ...updatesOrStatus, updated_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(payload)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  };

  const deleteJob = async (id) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) throw error;
  };

  return { getJobs, createJob, updateJob, deleteJob };
}
