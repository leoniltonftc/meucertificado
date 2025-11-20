
import React, { useState, useEffect } from 'react';
import { Upload, FileUp, CheckCircle, Mail, Trash2, Edit, X, Save, AlertTriangle, FileText, Link as LinkIcon, ArrowRight, RefreshCw, Table, Filter } from 'lucide-react';
import { Event, Participant } from '../types';
import { Button } from '../components/Button';

export default function ParticipantManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  // Import States
  const [importMode, setImportMode] = useState(false);
  const [importTab, setImportTab] = useState<'manual' | 'sheets'>('sheets');
  
  // Manual Import State
  const [rawInput, setRawInput] = useState('');

  // Google Sheets State
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState({ name: '', cpf: '', email: '' });
  
  // Filter State
  const [filterColumn, setFilterColumn] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('');

  const [isFetchingSheet, setIsFetchingSheet] = useState(false);
  
  // Editing State
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem('events') || '[]');
    setEvents(savedEvents);
    if (savedEvents.length > 0 && !selectedEventId) setSelectedEventId(savedEvents[0].id);

    const savedPart = JSON.parse(localStorage.getItem('participants') || '[]');
    setParticipants(savedPart);
  }, []);

  const saveParticipants = (newList: Participant[]) => {
    setParticipants(newList);
    localStorage.setItem('participants', JSON.stringify(newList));
  };

  // --- CSV / SHEET PARSING UTILS ---

  const parseCSVLine = (text: string) => {
    // Simple CSV parser that handles quotes
    const result = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }
    result.push(cell.trim());
    return result;
  };

  const extractSheetId = (url: string) => {
    const matches = url.match(/\/d\/(.*?)(\/|$)/);
    return matches ? matches[1] : null;
  };

  const handleFetchSheet = async () => {
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      alert("URL inválida. Certifique-se de copiar o link completo do Google Sheets.");
      return;
    }

    setIsFetchingSheet(true);
    setSheetData([]);
    setSheetHeaders([]);
    setFilterColumn(''); // Reset filter when fetching new sheet

    try {
      // Fetch as CSV export
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error("Falha ao acessar a planilha. Verifique se ela está pública (Arquivo > Compartilhar > Qualquer pessoa com o link) ou 'Publicada na Web'.");
      }

      const text = await response.text();
      const lines = text.split('\n').filter(l => l.trim());
      
      if (lines.length > 0) {
        const headers = parseCSVLine(lines[0]);
        const dataRows = lines.slice(1).map(parseCSVLine);
        
        setSheetHeaders(headers);
        setSheetData(dataRows);
        
        // Auto-guess mapping
        const newMapping = { name: '', cpf: '', email: '' };
        headers.forEach(h => {
            const lower = h.toLowerCase();
            if (lower.includes('nome') || lower.includes('participante')) newMapping.name = h;
            if (lower.includes('cpf') || lower.includes('documento')) newMapping.cpf = h;
            if (lower.includes('email') || lower.includes('e-mail')) newMapping.email = h;
        });
        setColumnMapping(newMapping);
      } else {
        alert("A planilha parece estar vazia.");
      }

    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setIsFetchingSheet(false);
    }
  };

  const handleImportSheet = () => {
    if (!columnMapping.name) {
       alert("Por favor, selecione pelo menos a coluna referente ao NOME.");
       return;
    }

    const nameIdx = sheetHeaders.indexOf(columnMapping.name);
    const cpfIdx = sheetHeaders.indexOf(columnMapping.cpf);
    const emailIdx = sheetHeaders.indexOf(columnMapping.email);
    
    // Filter logic
    const filterIdx = filterColumn ? sheetHeaders.indexOf(filterColumn) : -1;
    
    const newParticipants: Participant[] = [];
    let skippedCount = 0;

    sheetData.forEach(row => {
        // Apply Filter if configured
        if (filterIdx >= 0 && filterCriteria) {
            const cellValue = row[filterIdx] || '';
            // Case insensitive comparison
            if (cellValue.trim().toLowerCase() !== filterCriteria.trim().toLowerCase()) {
                skippedCount++;
                return; // Skip this row
            }
        }

        const name = nameIdx >= 0 ? row[nameIdx] : '';
        const cpf = cpfIdx >= 0 ? row[cpfIdx] : '';
        const email = emailIdx >= 0 ? row[emailIdx] : '';

        if (name) {
             newParticipants.push({
                id: crypto.randomUUID(),
                name: name.replace(/^"|"$/g, ''), // remove extra quotes if CSV parser missed any
                cpf: cpf.replace(/^"|"$/g, ''),
                email: email.replace(/^"|"$/g, ''),
                eventId: selectedEventId,
                attended: true
             });
        }
    });

    if (newParticipants.length > 0) {
        const updated = [...participants, ...newParticipants];
        saveParticipants(updated);
        setImportMode(false);
        setSheetData([]);
        setSheetUrl('');
        
        let msg = `${newParticipants.length} participantes importados com sucesso.`;
        if (skippedCount > 0) {
            msg += `\n(${skippedCount} registros ignorados pelo filtro "${filterColumn} = ${filterCriteria}")`;
        }
        alert(msg);
    } else if (skippedCount > 0) {
        alert(`Nenhum participante importado. ${skippedCount} registros foram ignorados pelo filtro.`);
    } else {
        alert("Nenhum dado válido encontrado para importação.");
    }
  };

  const handleManualImport = () => {
    if (!rawInput.trim()) return;
    
    const lines = rawInput.split('\n');
    const newParticipants: Participant[] = [];

    lines.forEach(line => {
      if (!line.trim()) return;
      const parts = line.split(',').map(part => part.trim());
      if (parts[0]) {
        newParticipants.push({
          id: crypto.randomUUID(),
          name: parts[0],
          cpf: parts[1] || '',
          email: parts[2] || '',
          eventId: selectedEventId,
          attended: true, 
        });
      }
    });
    
    if (newParticipants.length > 0) {
      const updated = [...participants, ...newParticipants];
      saveParticipants(updated);
      setImportMode(false);
      setRawInput('');
      alert(`${newParticipants.length} participantes importados manualmente.`);
    }
  };

  const issueCertificate = (p: Participant) => {
    const certId = crypto.randomUUID().substring(0, 8).toUpperCase();
    const updated = participants.map(item => 
      item.id === p.id ? { ...item, certificateId: certId } : item
    );
    saveParticipants(updated);
    // Optional: alert(`Certificado gerado para ${p.name}.`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este participante?")) {
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
          <FileUp size={18} className="mr-2" /> {importMode ? 'Fechar Importação' : 'Importar Lista'}
        </Button>
      </div>

      {importMode && (
        <div className="mb-8 bg-white p-6 rounded-xl border border-indigo-100 shadow-md animate-fade-in">
          <div className="flex border-b mb-4">
             <button 
                className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${importTab === 'sheets' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setImportTab('sheets')}
             >
                <LinkIcon size={16} /> Google Sheets
             </button>
             <button 
                className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${importTab === 'manual' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setImportTab('manual')}
             >
                <FileText size={16} /> Texto Manual (CSV)
             </button>
          </div>

          {/* GOOGLE SHEETS IMPORT */}
          {importTab === 'sheets' && (
             <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800 mb-4">
                   <strong>Instruções:</strong>
                   <ol className="list-decimal ml-4 mt-1 space-y-1">
                      <li>Abra sua planilha no Google Sheets.</li>
                      <li>Vá em <b>Arquivo {'>'} Compartilhar {'>'} Publicar na Web</b> (ou deixe o link público para leitura).</li>
                      <li>Copie a URL do navegador e cole abaixo.</li>
                   </ol>
                </div>

                <div className="flex gap-2">
                   <input 
                      type="text" 
                      className="flex-1 p-2 border rounded-md"
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMHs0..."
                      value={sheetUrl}
                      onChange={e => setSheetUrl(e.target.value)}
                   />
                   <Button onClick={handleFetchSheet} isLoading={isFetchingSheet} variant="secondary">
                      <RefreshCw size={16} className="mr-2"/> Carregar Colunas
                   </Button>
                </div>

                {sheetHeaders.length > 0 && (
                   <div className="mt-6 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* MAPPING SECTION */}
                         <div>
                             <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Table size={18} className="text-indigo-600"/> Mapeamento de Dados
                             </h4>
                             <div className="grid grid-cols-1 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Coluna NOME (Obrigatório)</label>
                                    <select 
                                    className="w-full p-2 border rounded bg-white"
                                    value={columnMapping.name}
                                    onChange={e => setColumnMapping({...columnMapping, name: e.target.value})}
                                    >
                                    <option value="">-- Selecione --</option>
                                    {sheetHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Coluna CPF</label>
                                    <select 
                                    className="w-full p-2 border rounded bg-white"
                                    value={columnMapping.cpf}
                                    onChange={e => setColumnMapping({...columnMapping, cpf: e.target.value})}
                                    >
                                    <option value="">-- Selecione / Ignorar --</option>
                                    {sheetHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Coluna E-MAIL</label>
                                    <select 
                                    className="w-full p-2 border rounded bg-white"
                                    value={columnMapping.email}
                                    onChange={e => setColumnMapping({...columnMapping, email: e.target.value})}
                                    >
                                    <option value="">-- Selecione / Ignorar --</option>
                                    {sheetHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                             </div>
                         </div>

                         {/* FILTER SECTION */}
                         <div>
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Filter size={18} className="text-amber-600"/> Filtragem Opcional
                             </h4>
                             <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                <p className="text-xs text-amber-800 mb-3">
                                    Importar apenas se a coluna selecionada for igual ao valor especificado.
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Filtrar pela Coluna:</label>
                                        <select 
                                            className="w-full p-2 border rounded bg-white"
                                            value={filterColumn}
                                            onChange={e => setFilterColumn(e.target.value)}
                                        >
                                            <option value="">-- Sem Filtro (Importar Tudo) --</option>
                                            {sheetHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    </div>
                                    
                                    {filterColumn && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Valor deve ser igual a:</label>
                                            <input 
                                                type="text"
                                                className="w-full p-2 border rounded bg-white"
                                                placeholder="Ex: Pago, Presente, Sim"
                                                value={filterCriteria}
                                                onChange={e => setFilterCriteria(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                             </div>
                         </div>
                      </div>

                      {/* PREVIEW */}
                      <div className="mt-6">
                         <p className="text-xs font-semibold text-slate-500 mb-2">Pré-visualização (3 primeiros registros):</p>
                         <div className="bg-white border rounded-md overflow-hidden">
                            <table className="w-full text-xs text-left">
                               <thead className="bg-slate-100">
                                  <tr>
                                     <th className="p-2">Nome (Mapeado)</th>
                                     <th className="p-2">CPF (Mapeado)</th>
                                     {filterColumn && <th className="p-2 bg-amber-50">Filtro ({filterColumn})</th>}
                                  </tr>
                               </thead>
                               <tbody>
                                  {sheetData.slice(0, 3).map((row, idx) => {
                                     const nameIdx = sheetHeaders.indexOf(columnMapping.name);
                                     const cpfIdx = sheetHeaders.indexOf(columnMapping.cpf);
                                     const filterIdx = filterColumn ? sheetHeaders.indexOf(filterColumn) : -1;
                                     
                                     const filterVal = filterIdx >= 0 ? row[filterIdx] : '';
                                     const isMatch = !filterColumn || (filterCriteria && filterVal.trim().toLowerCase() === filterCriteria.trim().toLowerCase());

                                     return (
                                        <tr key={idx} className={`border-t ${!isMatch && filterColumn ? 'opacity-40 bg-slate-50' : ''}`}>
                                           <td className="p-2 font-medium">{nameIdx >= 0 ? row[nameIdx] : <span className="text-red-300">-</span>}</td>
                                           <td className="p-2">{cpfIdx >= 0 ? row[cpfIdx] : <span className="text-slate-300">-</span>}</td>
                                           {filterColumn && (
                                               <td className="p-2 font-mono">
                                                   {filterVal} 
                                                   {isMatch ? <CheckCircle size={12} className="inline ml-1 text-green-500"/> : <X size={12} className="inline ml-1 text-red-400"/>}
                                               </td>
                                           )}
                                        </tr>
                                     );
                                  })}
                               </tbody>
                            </table>
                         </div>
                      </div>

                      <div className="flex justify-end mt-4">
                         <Button onClick={handleImportSheet} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle size={18} className="mr-2"/> Confirmar Importação
                         </Button>
                      </div>
                   </div>
                )}
             </div>
          )}

          {/* MANUAL IMPORT */}
          {importTab === 'manual' && (
            <div>
                <p className="text-sm text-slate-600 mb-2">
                  Cole a lista abaixo. Formato: <b>Nome, CPF, Email</b> (um por linha).
                </p>
                <textarea 
                  className="w-full p-3 rounded-md border border-slate-300 h-32 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="João da Silva, 123.456.789-00, joao@email.com&#10;Maria Oliveira, 987.654.321-11, maria@email.com"
                  value={rawInput}
                  onChange={e => setRawInput(e.target.value)}
                />
                <div className="flex justify-end mt-3">
                  <Button onClick={handleManualImport}>Processar Texto</Button>
                </div>
            </div>
          )}
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
