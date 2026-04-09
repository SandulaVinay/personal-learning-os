import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for future auth changes (login/logout events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (currentSession) => {
    if (!currentSession) {
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }

    // Step 2c: Invite-only gate
    // Query the allowed_users table. Row Level Security will ensure we only get a 
    // row back if the user's email actually exists in that table.
    const { data, error } = await supabase
      .from('allowed_users')
      .select('id')
      .limit(1);

    if (error || !data || data.length === 0) {
      // Access restricted: terminate session locally and clear tokens
      await supabase.auth.signOut();
      setAuthError('Access restricted. Your email is not on the allowed list.');
      setSession(null);
      setUser(null);
    } else {
      // Access granted
      setAuthError(null);
      setSession(currentSession);
      setUser(currentSession.user);
    }
    setLoading(false);
  };

  const signIn = async () => {
    setAuthError(null);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL,
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    authError,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
