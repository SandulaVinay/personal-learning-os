import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/shared/AuthProvider';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import Layout from './components/shared/Layout';
import Home from './pages/Home';
import Tracks from './pages/Tracks';
import Notes from './pages/Notes';
import Jobs from './pages/Jobs';
import OfflineStatus from './components/shared/OfflineStatus';

function LoginScreen() {
  const { signIn, authError, session } = useAuth();
  
  if (session) return <Navigate to="/" replace />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-6">
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">📚</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Personal Learning OS</h1>
        <p className="text-slate-500 mb-8 font-medium">A depth-first tracker for solo learners.</p>
        
        {authError && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm shadow-sm">
            {authError}
          </div>
        )}
        
        <button 
          onClick={signIn}
          className="w-full px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <OfflineStatus />
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Home />} />
            <Route path="tracks" element={<Tracks />} />
            <Route path="notes" element={<Notes />} />
            <Route path="jobs" element={<Jobs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
