import React, { useState, useEffect } from 'react';
import { Download, Search, AlertCircle, Award, Clock, Star, Sparkles, BookOpen } from 'lucide-react';
import { User, Participant, Event } from '../types';
import { Button } from '../components/Button';
import { generatePDF } from '../utils/pdfGenerator';

export default function UserCertificates({ user }: { user: User }) {
  const [myCertificates, setMyCertificates] = useState<(Participant & { event: Event })[]>([]);
  const [participantName, setParticipantName] = useState<string>('');
  const [stats, setStats] = useState({ totalHours: 0, totalCerts: 0 });

  useEffect(() => {
    if (!user.cpf) return;

    const allEvents: Event[] = JSON.parse(localStorage.getItem('events') || '[]');
    const allParticipants: Participant[] = JSON.parse(localStorage.getItem('participants') || '[]');
    
    // Normalize CPF for comparison (remove non-digits)
    const userCpfClean = user.cpf.replace(/\D/g, '');

    // Find all records for this user
    const userRecords = allParticipants.filter(p => {
        const pCpfClean = (p.cpf || '').replace(/\D/g, '');
        return pCpfClean === userCpfClean && p.certificateId;
    });
    
    // Enrich with Event Data
    const enriched = userRecords.map(record => {
      const event = allEvents.find(e => e.id === record.eventId);
      return event ? { ...record, event } : null;
    }).filter(Boolean) as (Participant & { event: Event })[];

    setMyCertificates(enriched);

    // Extract Stats & Identify Name
    if (enriched.length > 0) {
      // Try to find the most frequent name or just take the first one to personalize the UI
      // In case of typos in different events, picking the most recent is usually safe
      setParticipantName(enriched[0].name); 
      
      const hours = enriched.reduce((acc, curr) => acc + (curr.event.hours || 0), 0);
      setStats({ totalHours: hours, totalCerts: enriched.length });
    }
  }, [user.cpf]);

  const handleDownload = (cert: Participant & { event: Event }) => {
    if (!cert.certificateId) return;
    generatePDF(cert, cert.event, cert.certificateId);
  };

  // Helper for greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white py-12 px-8 shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <Award size={300} />
         </div>
         
         <div className="max-w-5xl mx-auto relative z-10">
            {myCertificates.length > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-2 text-indigo-200 animate-fade-in">
                  <Sparkles size={20} />
                  <span className="uppercase tracking-wider text-sm font-semibold">Área do Aluno</span>
                </div>
                <h1 className="text-4xl font-bold mb-4">
                  {getGreeting()}, {participantName.split(' ')[0]}!
                </h1>
                <p className="text-lg text-indigo-100 max-w-2xl">
                  Sua jornada de conhecimento está registrada aqui. Parabéns pelo seu empenho e dedicação contínua em aprender.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">Área do Participante</h1>
                <p className="text-indigo-200">Acesse seus certificados utilizando seu CPF.</p>
              </>
            )}
         </div>
      </div>

      {/* Stats Bar */}
      {myCertificates.length > 0 && (
        <div className="max-w-5xl mx-auto px-8 -mt-8 relative z-20 mb-10">
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                   <Award size={24} />
                </div>
                <div>
                   <p className="text-slate-500 text-sm">Certificados Emitidos</p>
                   <p className="text-2xl font-bold text-slate-800">{stats.totalCerts}</p>
                </div>
             </div>
             <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0">
                <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                   <Clock size={24} />
                </div>
                <div>
                   <p className="text-slate-500 text-sm">Horas Acumuladas</p>
                   <p className="text-2xl font-bold text-slate-800">{stats.totalHours}h</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                   <Star size={24} />
                </div>
                <div>
                   <p className="text-slate-500 text-sm">Nível de Participação</p>
                   <p className="text-2xl font-bold text-slate-800">
                     {stats.totalCerts > 5 ? 'Expert' : stats.totalCerts > 2 ? 'Avançado' : 'Iniciante'}
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Certificates Grid */}
      <div className="max-w-5xl mx-auto px-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
           <BookOpen size={20} className="text-indigo-600"/> Minhas Conquistas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myCertificates.length === 0 && (
            <div className="col-span-2 text-center py-16 bg-white rounded-xl shadow-sm border border-dashed border-slate-300">
              <div className="mx-auto bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                 <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700">Nenhum certificado localizado</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto px-4">
                Não encontramos registros para o CPF <b>{user.cpf}</b>. 
                <br/>Se você participou recentemente, aguarde a emissão pelo organizador.
              </p>
            </div>
          )}
          
          {myCertificates.map((cert) => (
            <div key={cert.id} className="group bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 relative">
              {/* Decoration Line */}
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full"></div>
              
              <div className="p-6 flex-1 relative">
                {/* Watermark Icon */}
                <Award className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 rotate-12" size={120} />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded">
                        Certificado Oficial
                      </span>
                      <span className="text-xs text-slate-400">{new Date(cert.event.endDate).getFullYear()}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-indigo-700 transition-colors">
                      {cert.event.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 mb-4">
                      {cert.event.organizer}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                       <div className="flex items-center gap-1">
                          <Clock size={14} /> {cert.event.hours} Horas
                       </div>
                       <div className="flex items-center gap-1">
                          <Star size={14} /> 100% Presença
                       </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-100 mb-2">
                       <p className="text-[10px] uppercase text-slate-400 font-bold">Código de Autenticidade</p>
                       <p className="font-mono text-sm text-slate-700 tracking-wide">{cert.certificateId}</p>
                    </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 relative z-10">
                <Button variant="primary" className="w-full shadow-sm group-hover:bg-indigo-700" onClick={() => handleDownload(cert)}>
                  <Download size={18} className="mr-2" /> Baixar PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}