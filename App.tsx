
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileBadge, Search, LogOut, ShieldCheck, Palette, UserCog, Home as HomeIcon, Menu, X } from 'lucide-react';
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

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

// Navigation Component
const Sidebar = ({ user, onLogout, isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  
  if (!user) return null;

  const isActive = (path: string) => location.pathname === path ? "bg-indigo-800 text-white" : "text-indigo-100 hover:bg-indigo-800 hover:text-white";

  const LinkItem = ({ to, icon: Icon, label }: any) => (
    <Link 
      to={to} 
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(to)}`}
    >
      <Icon size={20} /> {label}
    </Link>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-indigo-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-indigo-800 flex justify-between items-center shrink-0">
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2" onClick={onClose}>
            <FileBadge /> CertPro
          </Link>
          <button onClick={onClose} className="md:hidden text-indigo-300 hover:text-white p-1 rounded hover:bg-indigo-800">
            <X size={24} />
          </button>
        </div>
        
        {/* User Info */}
        <div className="px-6 py-3 text-xs text-indigo-300 uppercase tracking-wider font-bold border-b border-indigo-800/30 shrink-0">
           Olá, {user.name.split(' ')[0]}
        </div>
        
        {/* Scrollable Navigation Area */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {user.role === UserRole.ADMIN && (
            <>
              <LinkItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
              <LinkItem to="/admin/templates" icon={Palette} label="Modelos" />
              <LinkItem to="/admin/events" icon={FileBadge} label="Eventos" />
              <LinkItem to="/admin/participants" icon={Users} label="Participantes" />
              <LinkItem to="/admin/users" icon={UserCog} label="Administradores" />
            </>
          )}

          {user.role === UserRole.PARTICIPANT && (
            <LinkItem to="/my-certificates" icon={FileBadge} label="Meus Certificados" />
          )}
          
          <div className="pt-4 mt-4 border-t border-indigo-800">
             <LinkItem to="/" icon={HomeIcon} label="Site Inicial" />
             <LinkItem to="/validate" icon={ShieldCheck} label="Validar" />
          </div>
        </nav>

        {/* Fixed Footer with Logout */}
        <div className="p-4 border-t border-indigo-800 shrink-0 bg-indigo-900">
          <button onClick={onLogout} className="flex items-center gap-3 text-indigo-300 hover:text-white px-4 py-2 w-full rounded-lg hover:bg-indigo-800 transition-colors">
            <LogOut size={20} /> Sair do Sistema
          </button>
        </div>
      </div>
    </>
  );
};

// Inner component to use hooks like useNavigate
const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

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
    setIsSidebarOpen(false);
    navigate('/'); // Redirect to home after logout
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {user && (
        <>
            {/* Mobile Header Bar */}
            <div className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                <div className="font-bold flex gap-2 items-center text-lg">
                    <FileBadge /> CertPro
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(true)} 
                    className="text-white p-2 rounded hover:bg-indigo-800 transition-colors"
                >
                    <Menu size={28} />
                </button>
            </div>

            <Sidebar 
                user={user} 
                onLogout={handleLogout} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)}
            />
        </>
      )}
      
      <main className={`transition-all duration-300 ${user ? 'md:ml-64' : ''}`}>
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
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
