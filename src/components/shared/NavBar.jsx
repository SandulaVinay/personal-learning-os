import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { BookOpen } from 'lucide-react';

export default function NavBar() {
  const { signOut } = useAuth();
  const location = useLocation();
  
  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Tracks', path: '/tracks' },
    { name: 'Notes Vault', path: '/notes' },
    { name: 'Jobs', path: '/jobs' },
  ];

  return (
    <nav className="bg-slate-950 text-slate-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:text-blue-400 transition">
          <BookOpen className="text-blue-500" size={24} />
          Learning OS
        </Link>
        
        <div className="flex items-center gap-6 font-medium text-sm">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} className={`transition ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
                {link.name}
              </Link>
            );
          })}
          
          <button 
            onClick={signOut} 
            className="ml-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
        
      </div>
    </nav>
  );
}
