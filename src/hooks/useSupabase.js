import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../components/shared/AuthProvider';

export function useSupabase() {
  const { user } = useAuth();
  
  const getTracks = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching tracks:', error);
      return [];
    }
    return data;
  };

  const createTrack = async (trackData) => {
    if (!user) throw new Error('Not logged in');
    
    const { data, error } = await supabase
      .from('tracks')
      .insert([{ ...trackData, user_id: user.id }])
      .select();
      
    if (error) throw error;
    if (error) throw error;
    return data[0];
  };

  const deleteTrack = async (id) => {
     const { error } = await supabase.from('tracks').delete().eq('id', id);
     if (error) throw error;
  };

  const getSessions = async (trackId) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('track_id', trackId)
      .order('logged_at', { ascending: false });
    if (error) console.error('Error fetching sessions:', error);
    return data || [];
  };

  const logSession = async (sessionData) => {
    if (!user) throw new Error('Not logged in');
    const payload = { ...sessionData, user_id: user.id };
    
    // Quick offline detection before fetch
    if (!navigator.onLine) {
       import('../lib/syncManager').then(({ addToSyncQueue }) => addToSyncQueue('session', payload));
       return { ...payload, id: 'temp-' + Date.now(), logged_at: new Date().toISOString() };
    }

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([payload])
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      if (err.message.includes('fetch') || err.message.includes('network')) {
         import('../lib/syncManager').then(({ addToSyncQueue }) => addToSyncQueue('session', payload));
         return { ...payload, id: 'temp-' + Date.now(), logged_at: new Date().toISOString() };
      }
      throw err;
    }
  };

  const deleteSession = async (id) => {
     if (id.toString().startsWith('temp-')) return; 
     const { error } = await supabase.from('sessions').delete().eq('id', id);
     if (error) throw error;
  };

  const getMilestones = async (trackId) => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('track_id', trackId)
      .order('logged_at', { ascending: false });
    if (error) console.error('Error fetching milestones:', error);
    return data || [];
  };

  const getAllSessions = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('logged_at', { ascending: false });
    if (error) console.error('Error fetching all sessions:', error);
    return data || [];
  };

  const logMilestone = async (milestoneData) => {
    if (!user) throw new Error('Not logged in');
    const { data, error } = await supabase
      .from('milestones')
      .insert([{ ...milestoneData, user_id: user.id }])
      .select();
    if (error) throw error;
    return data[0];
  };

  const updateMilestone = async (id, updates) => {
     if (!user) throw new Error('Not logged in');
     const { data, error } = await supabase
       .from('milestones')
       .update(updates)
       .eq('id', id)
       .select();
     if (error) throw error;
     return data[0];
  };

  const deleteMilestone = async (id) => {
     const { error } = await supabase.from('milestones').delete().eq('id', id);
     if (error) throw error;
  };

  return { getTracks, createTrack, deleteTrack, getSessions, getAllSessions, logSession, deleteSession, getMilestones, logMilestone, updateMilestone, deleteMilestone };
}
