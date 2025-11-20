
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileBadge, Users, ArrowRight, LayoutTemplate, CheckCircle, FileText, TrendingUp, Calendar, Clock, Award, BarChart3, PieChart } from 'lucide-react';
import { Button } from '../components/Button';
import { User, Event, Participant } from '../types';

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  const [stats, setStats] = useState({
    events: 0,
    participants: 0,
    certificates: 0,
    hours: 0,
    efficiency: 0
  });

  useEffect(() => {
    // Calcular estatísticas reais do sistema
    const events: Event[] = JSON.parse(localStorage.getItem('events') || '[]');
    const participants: Participant[] = JSON.parse(localStorage.getItem('participants') || '[]');
    
    const issuedCerts = participants.filter(p => p.certificateId).length;
    
    // Calcular horas totais certificadas
    let totalHours = 0;
    participants.forEach(p => {
        if (p.certificateId) {
            const event = events.find(e => e.id === p.eventId);
            if (event) totalHours += (event.hours || 0);
        }
    });

    const efficiency = participants.length > 0 
        ? Math.round((issuedCerts / participants.length) * 100) 
        : 0;

    setStats({
        events: events.length,
        participants: participants.length,
        certificates: issuedCerts,
        hours: totalHours,
        efficiency
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header / Nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xl tracking-tight">
            <FileBadge className="w-8 h-8 text-indigo-600" />
            CertificadoPro
          </div>
          <div className="flex items-center gap-4">
            <Link to="/validate" className="text-slate-600 hover:text-indigo-600 font-medium text-sm hidden md:block">
              Validar Autenticidade
            </Link>
            {user ? (
               <Link to={user.role === 'ADMIN' ? "/admin" : "/my-certificates"}>
                 <Button className="shadow-indigo-200 shadow-md">Ir para o Painel</Button>
               </Link>
            ) : (
               <Link to="/login">
                 <Button variant="primary" className="shadow-indigo-200 shadow-md">Acessar Sistema</Button>
               </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 text-xs font-bold tracking-wider uppercase mb-8 backdrop-blur-sm animate-fade-in">
             <ShieldCheck size={14} /> Plataforma Oficial de Gestão
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
            Certificação Digital <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Simples e Segura</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Sistema completo para gestão de eventos acadêmicos e corporativos. 
            Emita, distribua e valide certificados com tecnologia de ponta e total conformidade.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
             <Link to="/login">
               <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 shadow-lg shadow-indigo-900/50 border-0">
                 Começar Agora <ArrowRight size={20} className="ml-2" />
               </Button>
             </Link>
             <Link to="/validate">
               <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-slate-600 hover:bg-slate-800 hover:border-slate-500 px-8 py-4">
                 <ShieldCheck size={20} className="mr-2" /> Validar Código
               </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* LIVE STATS DASHBOARD */}
      <section className="-mt-16 relative z-20 px-4">
         <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
               <div className="flex justify-center mb-3 text-indigo-600">
                  <Calendar size={32} strokeWidth={1.5} />
               </div>
               <div className="text-4xl font-bold text-slate-900 mb-1">{stats.events}</div>
               <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Eventos Realizados</div>
            </div>
            
            <div className="text-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
               <div className="flex justify-center mb-3 text-blue-600">
                  <Users size={32} strokeWidth={1.5} />
               </div>
               <div className="text-4xl font-bold text-slate-900 mb-1">{stats.participants}</div>
               <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Participantes</div>
            </div>

            <div className="text-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
               <div className="flex justify-center mb-3 text-emerald-600">
                  <Award size={32} strokeWidth={1.5} />
               </div>
               <div className="text-4xl font-bold text-slate-900 mb-1">{stats.certificates}</div>
               <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Certificados Emitidos</div>
            </div>

            <div className="text-center">
               <div className="flex justify-center mb-3 text-amber-600">
                  <Clock size={32} strokeWidth={1.5} />
               </div>
               <div className="text-4xl font-bold text-slate-900 mb-1">{stats.hours}h</div>
               <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Horas de Conteúdo</div>
            </div>
         </div>
      </section>

      {/* GRAPH & RESULTS SECTION */}
      <section className="py-20 bg-slate-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               
               {/* Left: Text Context */}
               <div>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
                     <TrendingUp size={24} />
                     <span>Indicadores de Performance</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                     Resultados que geram <br/>impacto real.
                  </h2>
                  <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                     Acompanhe em tempo real o engajamento dos seus eventos. 
                     Nossa plataforma garante que 100% dos participantes elegíveis recebam 
                     sua certificação de forma automática e auditável.
                  </p>

                  <div className="space-y-6">
                     <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-lg text-green-700 mt-1">
                           <CheckCircle size={20} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-800">Alta Disponibilidade</h4>
                           <p className="text-sm text-slate-600">Sistema sempre online para validação e download.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700 mt-1">
                           <BarChart3 size={20} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-800">Gestão Centralizada</h4>
                           <p className="text-sm text-slate-600">Controle múltiplos eventos e modelos em um só lugar.</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: Visual Graphs (CSS Only) */}
               <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                     <span>Taxa de Certificação</span>
                     <PieChart size={20} className="text-slate-400"/>
                  </h3>

                  {/* Efficiency Bar */}
                  <div className="mb-8">
                     <div className="flex justify-between text-sm font-medium mb-2">
                        <span className="text-slate-600">Eficiência de Emissão</span>
                        <span className="text-indigo-600">{stats.efficiency}%</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div 
                           className="bg-indigo-600 h-4 rounded-full transition-all duration-1000 ease-out"
                           style={{ width: `${stats.efficiency}%` }}
                        ></div>
                     </div>
                     <p className="text-xs text-slate-400 mt-2">Relação entre inscritos totais e certificados gerados.</p>
                  </div>

                  {/* Comparison Bars */}
                  <div className="space-y-4">
                     <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-4">Comparativo Global</h4>
                     
                     <div className="group">
                        <div className="flex justify-between text-xs mb-1">
                           <span className="font-medium text-slate-600">Total Inscritos</span>
                           <span className="font-bold text-slate-800">{stats.participants}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-sm h-8 relative overflow-hidden">
                           <div className="absolute top-0 left-0 h-full bg-blue-500 w-full opacity-20"></div>
                           <div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: '100%' }}></div> 
                           {/* Always 100% relative to itself, visually just a bar */}
                        </div>
                     </div>

                     <div className="group">
                        <div className="flex justify-between text-xs mb-1">
                           <span className="font-medium text-slate-600">Total Certificados</span>
                           <span className="font-bold text-slate-800">{stats.certificates}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-sm h-8 relative overflow-hidden">
                           <div 
                              className="h-full bg-emerald-500 transition-all duration-1000" 
                              style={{ width: `${stats.participants > 0 ? (stats.certificates / stats.participants) * 100 : 0}%` }}
                           ></div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                     <p className="text-sm text-slate-500">
                        Última atualização: <span className="font-mono text-slate-700">{new Date().toLocaleDateString()}</span>
                     </p>
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
              <FileBadge className="w-6 h-6" /> CertificadoPro
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Plataforma líder em gestão documental para eventos.
              Transformando a gestão acadêmica e corporativa com tecnologia de ponta e segurança.
            </p>
          </div>
          <div className="flex flex-col md:items-end">
            <h4 className="text-white font-bold mb-4">Acesso Rápido</h4>
            <ul className="space-y-2 text-sm md:text-right">
              <li><Link to="/login" className="hover:text-white transition-colors">Área Administrativa</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Portal do Aluno</Link></li>
              <li><Link to="/validate" className="hover:text-white transition-colors">Validação Pública</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
           &copy; 2025 CertificadoPro. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
