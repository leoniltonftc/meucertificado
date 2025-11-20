
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileBadge, Search, LogOut, ShieldCheck, Palette, UserCog } from 'lucide-react';
import { UserRole, User } from './types';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EventManager from './pages/EventManager';
import ParticipantManager from './pages/ParticipantManager';
import UserCertificates from './pages/UserCertificates';
import Validator from './pages/Validator';
import TemplateManager from './pages/TemplateManager';
import AdminManager from './pages/AdminManager';

// Navigation Component
const Sidebar = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => {
  const location = useLocation();
  
  if (!user) return null;

  const isActive = (path: string) => location.pathname === path ? "bg-indigo-800 text-white" : "text-indigo-100 hover:bg-indigo-800 hover:text-white";

  return (
    <div className="w-64 bg-indigo-900 min-h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-indigo-800">
        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
          <FileBadge /> CertPro
        </Link>
        <p className="text-indigo-300 text-sm mt-2">Bem vindo, {user.name}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {user.role === UserRole.ADMIN && (
          <>
            <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin')}`}>
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            <Link to="/admin/events" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/events')}`}>
              <FileBadge size={20} /> Eventos
            </Link>
            <Link to="/admin/participants" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/participants')}`}>
              <Users size={20} /> Participantes
            </Link>
            <Link to="/admin/templates" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/templates')}`}>
              <Palette size={20} /> Modelos
            </Link>
            <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/users')}`}>
              <UserCog size={20} /> Administradores
            </Link>
          </>
        )}

        {user.role === UserRole.PARTICIPANT && (
          <Link to="/my-certificates" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/my-certificates')}`}>
            <FileBadge size={20} /> Meus Certificados
          </Link>
        )}
        
        <div className="pt-4 mt-4 border-t border-indigo-800">
           <Link to="/validate" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/validate')}`}>
              <ShieldCheck size={20} /> Validar
            </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-indigo-800">
        <button onClick={onLogout} className="flex items-center gap-3 text-indigo-300 hover:text-white px-4 py-2 w-full">
          <LogOut size={20} /> Sair
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // Simulate simple session persistence
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex">
        {user && <Sidebar user={user} onLogout={handleLogout} />}
        
        <main className={`flex-1 ${user ? 'ml-64' : ''} transition-all duration-300`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={user ? <Navigate to={user.role === UserRole.ADMIN ? "/admin" : "/my-certificates"} /> : <Login onLogin={handleLogin} />} />
            <Route path="/validate" element={<Validator />} />

            {/* Admin Routes */}
            <Route path="/admin" element={user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/admin/events" element={user?.role === UserRole.ADMIN ? <EventManager /> : <Navigate to="/login" />} />
            <Route path="/admin/participants" element={user?.role === UserRole.ADMIN ? <ParticipantManager /> : <Navigate to="/login" />} />
            <Route path="/admin/templates" element={user?.role === UserRole.ADMIN ? <TemplateManager /> : <Navigate to="/login" />} />
            <Route path="/admin/users" element={user?.role === UserRole.ADMIN ? <AdminManager /> : <Navigate to="/login" />} />

            {/* Participant Routes */}
            <Route path="/my-certificates" element={user?.role === UserRole.PARTICIPANT ? <UserCertificates user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}