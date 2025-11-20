
import React, { useState, useEffect } from 'react';
import { Upload, FileUp, CheckCircle, Mail, Trash2, Edit, X, Save, AlertTriangle } from 'lucide-react';
import { Event, Participant } from '../types';
import { Button } from '../components/Button';
import { parseParticipantData } from '../services/geminiService';

export default function ParticipantManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [rawInput, setRawInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [importMode, setImportMode] = useState(false);
  
  // State for Editing
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem('events') || '[]');
    setEvents(savedEvents);
    if (savedEvents.length > 0) setSelectedEventId(savedEvents[0].id);

    const savedPart = JSON.parse(localStorage.getItem('participants') || '[]');
    setParticipants(savedPart);
  }, []);

  const saveParticipants = (newList: Participant[]) => {
    setParticipants(newList);
    localStorage.setItem('participants', JSON.stringify(newList));
  };

  const handleImport = async () => {
    if (!rawInput.trim()) return;
    setIsParsing(true);
    
    const parsed = await parseParticipantData(rawInput);
    
    if (parsed && parsed.length > 0) {
      const newParticipants: Participant[] = parsed.map(p => ({
        id: crypto.randomUUID(),
        name: p.name,
        email: p.email,
        cpf: p.cpf || '',
        eventId: selectedEventId,
        attended: true, 
      }));

      const updated = [...participants, ...newParticipants];
      saveParticipants(updated);
      setImportMode(false);
      setRawInput('');
    } else {
      alert("Não foi possível identificar participantes. Verifique se o formato contém nomes e emails ou CPFs.");
    }
    setIsParsing(false);
  };

  const issueCertificate = (p: Participant) => {
    const certId = crypto.randomUUID().substring(0, 8).toUpperCase();
    const updated = participants.map(item => 
      item.id === p.id ? { ...item, certificateId: certId } : item
    );
    saveParticipants(updated);
    alert(`Certificado gerado para ${p.name}.`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este participante? Esta ação não pode ser desfeita.")) {
      const updated = participants.filter(p => p.id !== id);
      saveParticipants(updated);
    }
  };

  const handleEditClick = (p: Participant) => {
    setEditingParticipant({ ...p });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    const updated = participants.map(p => 
      p.id === editingParticipant.id ? editingParticipant : p
    );
    saveParticipants(updated);
    setEditingParticipant(null);
  };

  const filteredParticipants = participants.filter(p => p.eventId === selectedEventId);

  return (
    <div className="p-8 relative">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Participantes e Certificados</h2>

      <div className="flex flex-wrap items-center gap-4 mb-8 bg-white p-4 rounded-lg border shadow-sm">
        <label className="font-medium text-slate-700">Selecione o Evento:</label>
        <select 
          className="border p-2 rounded-md min-w-[250px]"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        
        <Button className="ml-auto" onClick={() => setImportMode(!importMode)}>
          <FileUp size={18} className="mr-2" /> Importar Lista
        </Button>
      </div>

      {importMode && (
        <div className="mb-8 bg-indigo-50 p-6 rounded-xl border border-indigo-100 animate-fade-in">
          <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
             <Upload size={20} /> Importação Inteligente (Gemini AI)
          </h3>
          <p className="text-sm text-indigo-700 mb-4">
            Cole a lista de presença (texto bruto). A IA extrairá Nome, Email e CPF automaticamente.
          </p>
          <textarea 
            className="w-full p-3 rounded-md border border-indigo-200 h-32 text-sm font-mono"
            placeholder="Ex: João Silva, 123.456.789-00, joao@email.com"
            value={rawInput}
            onChange={e => setRawInput(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <Button onClick={handleImport} isLoading={isParsing}>Processar e Adicionar</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Nome</th>
              <th className="p-4 font-semibold text-slate-600">CPF</th>
              <th className="p-4 font-semibold text-slate-600">Email</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredParticipants.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum participante neste evento.</td>
              </tr>
            )}
            {filteredParticipants.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 group">
                <td className="p-4 font-medium text-slate-900">{p.name}</td>
                <td className="p-4 font-mono text-slate-600 text-sm">{p.cpf || '-'}</td>
                <td className="p-4 text-slate-600 text-sm">{p.email}</td>
                <td className="p-4">
                  {p.certificateId ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Emitido
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pendente
                    </span>
                  )}
                </td>
                <td className="p-4 text-right flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditClick(p)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>

                  {p.certificateId ? (
                    <Button size="sm" variant="secondary" disabled className="opacity-50 ml-2">
                      <CheckCircle size={16} />
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => issueCertificate(p)} className="ml-2">
                      <Mail size={16} className="mr-1" /> Gerar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Editar Participante</h3>
              <button onClick={() => setEditingParticipant(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input 
                  type="text" required
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingParticipant.name}
                  onChange={e => setEditingParticipant({...editingParticipant, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                <input 
                  type="text"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingParticipant.cpf}
                  onChange={e => setEditingParticipant({...editingParticipant, cpf: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingParticipant.email}
                  onChange={e => setEditingParticipant({...editingParticipant, email: e.target.value})}
                />
              </div>

              {editingParticipant.certificateId && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-2 text-yellow-800 text-sm">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p>Atenção: Este participante já possui certificado emitido. Alterar os dados aqui não atualizará o PDF já gerado/baixado pelo aluno, apenas registros futuros.</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 mt-4 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingParticipant(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  <Save size={18} className="mr-2" /> Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
