import React, { useState } from 'react';
import { CheckCircle, XCircle, Search, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Participant, Event } from '../types';

export default function Validator() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [data, setData] = useState<{ participant: Participant, event: Event } | null>(null);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    
    const participants: Participant[] = JSON.parse(localStorage.getItem('participants') || '[]');
    const events: Event[] = JSON.parse(localStorage.getItem('events') || '[]');

    const foundParticipant = participants.find(p => p.certificateId === cleanCode);

    if (foundParticipant) {
      const foundEvent = events.find(e => e.id === foundParticipant.eventId);
      if (foundEvent) {
        setData({ participant: foundParticipant, event: foundEvent });
        setResult('valid');
        return;
      }
    }
    setResult('invalid');
    setData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 px-4">
      <div className="absolute top-6 left-6">
        <Link to="/" className="text-slate-500 hover:text-slate-800 flex items-center gap-2">
          <ArrowLeft size={20} /> Voltar
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
          <ShieldCheck size={36} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Validação de Certificados</h1>
        <p className="text-slate-500 mt-2">Insira o código único presente no certificado para verificar sua autenticidade.</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-100 p-8">
        <form onSubmit={handleValidate} className="relative mb-6">
          <input
            type="text"
            placeholder="Ex: A1B2-C3D4"
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none uppercase tracking-widest font-mono"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <Button type="submit" className="w-full mt-4">Verificar Código</Button>
        </form>

        {result === 'valid' && data && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
              <CheckCircle size={20} /> Certificado Válido
            </div>
            <div className="text-sm space-y-1 text-slate-700">
              <p><span className="font-semibold">Participante:</span> {data.participant.name}</p>
              <p><span className="font-semibold">Evento:</span> {data.event.title}</p>
              <p><span className="font-semibold">Data:</span> {new Date(data.event.endDate).toLocaleDateString('pt-BR')}</p>
              <p><span className="font-semibold">Carga Horária:</span> {data.event.hours}h</p>
            </div>
          </div>
        )}

        {result === 'invalid' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in text-center">
            <div className="flex items-center justify-center gap-2 text-red-700 font-bold mb-1">
              <XCircle size={20} /> Certificado Não Encontrado
            </div>
            <p className="text-xs text-red-600">Verifique se digitou o código corretamente.</p>
          </div>
        )}
      </div>
      
      <p className="mt-8 text-slate-400 text-sm">Sistema CertificadoPro AI © 2024</p>
    </div>
  );
}