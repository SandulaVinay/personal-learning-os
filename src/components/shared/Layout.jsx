import NavBar from './NavBar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      <NavBar />
      <main className="max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
