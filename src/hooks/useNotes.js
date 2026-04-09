import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../components/shared/AuthProvider';

export function useNotes() {
  const { user } = useAuth();

  const getNotes = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('notes')
      .select('*, tracks(name)')
      .order('created_at', { ascending: false });
      
    if (error) console.error('Error fetching notes:', error);
    return data || [];
  };

  const getHighPriorityNotes = async () => {
     if (!user) return [];
     const { data, error } = await supabase
       .from('notes')
       .select('*, tracks(name)')
       .eq('tag', 'high')
       .order('created_at', { ascending: false });
       
     if (error) console.error('Error fetching high priority notes:', error);
     
     // Randomly shuffle and extract 1 to 3 notes
     if (data && data.length > 0) {
       const shuffled = [...data].sort(() => 0.5 - Math.random());
       return shuffled.slice(0, Math.min(3, data.length));
     }
     return [];
  };

  const createNote = async (noteData) => {
    if (!user) throw new Error('Not logged in');
    const { data, error } = await supabase
      .from('notes')
      .insert([{ ...noteData, user_id: user.id }])
      .select('*, tracks(name)');
      
    if (error) throw error;
    return data[0];
  };

  return { getNotes, getHighPriorityNotes, createNote };
}
