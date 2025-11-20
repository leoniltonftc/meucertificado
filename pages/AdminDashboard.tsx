import React, { useEffect, useState } from 'react';
import { Calendar, Users, FileCheck, TrendingUp } from 'lucide-react';
import { Event, Participant } from '../types';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ events: 0, participants: 0, certificates: 0 });

  useEffect(() => {
    // Load stats from localStorage
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const participants: Participant[] = JSON.parse(localStorage.getItem('participants') || '[]');
    const certificates = participants.filter(p => p.certificateId).length;

    setStats({
      events: events.length,
      participants: participants.length,
      certificates
    });
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Painel de Controle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Eventos Totais" 
          value={stats.events} 
          icon={Calendar} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Participantes Inscritos" 
          value={stats.participants} 
          icon={Users} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Certificados Emitidos" 
          value={stats.certificates} 
          icon={FileCheck} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-600" /> Atividade Recente
        </h3>
        <div className="space-y-4">
           {stats.events === 0 ? (
             <p className="text-slate-500">Nenhuma atividade registrada. Comece criando um evento.</p>
           ) : (
             <p className="text-slate-500">Sistema pronto para operação. Utilize o menu lateral para gerenciar eventos.</p>
           )}
        </div>
      </div>
    </div>
  );
}