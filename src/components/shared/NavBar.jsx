import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, BriefcaseBusiness, ChevronUp, Clock3, FileText, GraduationCap, LayoutDashboard, LogOut, MoreHorizontal, Sparkles, X } from 'lucide-react';
import { useAuth } from './AuthProvider';

const navLinks = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Tracks', path: '/tracks', icon: GraduationCap },
  { name: 'Notes Vault', path: '/notes', icon: FileText },
  { name: 'Jobs', path: '/jobs', icon: BriefcaseBusiness },
  { name: 'History', path: '/history', icon: Clock3 },
  { name: 'AI Insights', path: '/ai', icon: Sparkles },
];

const isPathActive = (pathname, path) => path === '/' ? pathname === '/' : pathname.startsWith(path);

export default function NavBar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryLinks = navLinks.slice(0, 4);
  const moreLinks = navLinks.slice(4);

  return (
    <>
      <nav className="bg-slate-950/95 text-slate-100 sticky top-0 z-50 border-b border-white/10 shadow-lg shadow-slate-950/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-white transition hover:text-blue-300" aria-label="Learning OS home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 ring-1 ring-blue-400/20">
              <BookOpen className="text-blue-400" size={21} strokeWidth={2.2} />
            </span>
            <span>Learning OS</span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 font-medium text-sm">
            {navLinks.map(({ name, path, icon: Icon }) => (
              <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `min-h-11 px-3.5 rounded-xl inline-flex items-center gap-2 transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Icon size={17} />
                {name}
              </NavLink>
            ))}
            <button onClick={signOut} className="ml-1 min-h-11 px-3.5 rounded-xl inline-flex items-center gap-2 text-slate-400 hover:bg-white/5 hover:text-white transition" aria-label="Sign out">
              <LogOut size={17} />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-2 pointer-events-none">
        {moreOpen && (
          <>
            <button className="fixed inset-0 bg-slate-950/35 backdrop-blur-[2px] pointer-events-auto" onClick={() => setMoreOpen(false)} aria-label="Close menu" />
            <div className="relative mb-2 ml-auto w-[min(19rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/20 pointer-events-auto">
              <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700">
                <span>More</span>
                <button onClick={() => setMoreOpen(false)} className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100" aria-label="Close more menu">
                  <X size={18} />
                </button>
              </div>
              {moreLinks.map(({ name, path, icon: Icon }) => (
                <Link key={path} to={path} onClick={() => setMoreOpen(false)} className={`min-h-12 px-3 rounded-xl flex items-center gap-3 text-sm font-medium ${isPathActive(location.pathname, path) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <Icon size={19} />
                  {name}
                </Link>
              ))}
              <button onClick={signOut} className="w-full min-h-12 px-3 rounded-xl flex items-center gap-3 text-sm font-medium text-red-600 hover:bg-red-50">
                <LogOut size={19} />
                Sign Out
              </button>
            </div>
          </>
        )}

        <div className="relative mx-auto max-w-md h-[4.35rem] rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-2xl shadow-slate-950/15 backdrop-blur-xl pointer-events-auto">
          <div className="grid h-full grid-cols-5 gap-1">
            {primaryLinks.map(({ name, path, icon: Icon }) => {
              const active = isPathActive(location.pathname, path);
              return (
                <NavLink key={path} to={path} end={path === '/'} className={`relative min-w-0 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition active:scale-95 ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                  <span className="truncate max-w-full px-1">{name === 'Dashboard' ? 'Home' : name === 'Notes Vault' ? 'Notes' : name}</span>
                  {active && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-600" />}
                </NavLink>
              );
            })}
            <button onClick={() => setMoreOpen((open) => !open)} className={`relative min-w-0 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition active:scale-95 ${moreOpen || moreLinks.some(({ path }) => isPathActive(location.pathname, path)) ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`} aria-expanded={moreOpen} aria-label="More navigation options">
              {moreOpen ? <ChevronUp size={20} /> : <MoreHorizontal size={20} />}
              <span>More</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
