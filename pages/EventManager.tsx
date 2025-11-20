
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, MapPin, PenTool, BookOpen, Eye, Palette, Image, Copy, Upload, ArrowDownUp, AlignLeft, AlignCenter, AlignJustify, AlignRight, ArrowRightToLine, ArrowLeftToLine, Type } from 'lucide-react';
import { Event, Participant, CertificateTemplate } from '../types';
import { Button } from '../components/Button';
import { generatePDF } from '../utils/pdfGenerator';

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    organizer: '',
    hours: 4,
    location: '',
    signatureName: '',
    signatureRole: '',
    signatureImage: '',
    startDate: '',
    endDate: '',
    templateText: 'Certificamos que [NOME_DO_PARTICIPANTE], CPF: [CPF] participou de 100,00% do evento [NOME_EVENTO], realizado em [LOCAL], perfazendo a carga horária de [HORAS]h.',
    programContent: '',
    // Front Defaults
    textY: 95,
    textSize: 16,
    marginLeft: 30,
    marginRight: 30,
    textAlign: 'justify',
    textColor: '#000000',
    // Back Defaults
    programTextY: 40,
    programTextSize: 10,
    programMarginLeft: 20,
    programMarginRight: 20,
    programTextAlign: 'left',
    programTextColor: '#000000',
    // Signature Defaults
    signatureTextY: 170,
    signatureTextSize: 11,
    signatureTextColor: '#000000',
    signatureMarginLeft: 0,
    signatureMarginRight: 0
  });

  useEffect(() => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) setEvents(JSON.parse(savedEvents));

    const savedTemplates = localStorage.getItem('certificate_templates');
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
  }, []);

  const saveEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
    localStorage.setItem('events', JSON.stringify(newEvents));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentEvent.id) {
      const updated = events.map(ev => ev.id === currentEvent.id ? { ...ev, ...currentEvent } as Event : ev);
      saveEvents(updated);
    } else {
      const newEvent = { ...currentEvent, id: crypto.randomUUID(), status: 'active' } as Event;
      saveEvents([...events, newEvent]);
    }
    setIsEditing(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentEvent({ 
      title: '', description: '', organizer: '', hours: 4, startDate: '', endDate: '', 
      location: '', signatureName: '', signatureRole: '', signatureImage: '',
      templateText: '', programContent: '', backgroundImage: '', backImage: '',
      textY: 95, textSize: 16, marginLeft: 30, marginRight: 30, textAlign: 'justify', textColor: '#000000',
      programTextY: 40, programTextSize: 10, programMarginLeft: 20, programMarginRight: 20, programTextAlign: 'left', programTextColor: '#000000',
      signatureTextY: 170, signatureTextSize: 11, signatureTextColor: '#000000',
      signatureMarginLeft: 0, signatureMarginRight: 0
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      saveEvents(events.filter(e => e.id !== id));
    }
  };

  const handleCopy = (eventToCopy: Event) => {
    const newEvent: Event = {
      ...eventToCopy,
      id: crypto.randomUUID(),
      title: `${eventToCopy.title} (Cópia)`,
      status: 'draft'
    };
    saveEvents([...events, newEvent]);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCurrentEvent(prev => ({
        ...prev,
        templateText: template.frontText,
        programContent: template.backText,
        backgroundImage: template.backgroundImage,
        backImage: template.backImage,
        // Front
        textY: template.textY || 95,
        textSize: template.textSize || 16,
        marginLeft: template.marginLeft || 30,
        marginRight: template.marginRight || 30,
        textAlign: template.textAlign || 'justify',
        textColor: template.textColor || '#000000',
        // Back
        programTextY: template.programTextY || 40,
        programTextSize: template.programTextSize || 10,
        programMarginLeft: template.programMarginLeft || 20,
        programMarginRight: template.programMarginRight || 20,
        programTextAlign: template.programTextAlign || 'left',
        programTextColor: template.programTextColor || '#000000',
        // Signature
        signatureTextY: template.signatureTextY || 170,
        signatureTextSize: template.signatureTextSize || 11,
        signatureTextColor: template.signatureTextColor || '#000000',
        signatureMarginLeft: template.signatureMarginLeft || 0,
        signatureMarginRight: template.signatureMarginRight || 0
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'signature') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         if (type === 'front') {
            setCurrentEvent(prev => ({ ...prev, backgroundImage: reader.result as string }));
         } else if (type === 'back') {
            setCurrentEvent(prev => ({ ...prev, backImage: reader.result as string }));
         } else if (type === 'signature') {
            setCurrentEvent(prev => ({ ...prev, signatureImage: reader.result as string }));
         }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreview = () => {
     if (!currentEvent.title) {
         alert("Preencha os dados básicos do evento para visualizar.");
         return;
     }
     
     // Create dummy objects for preview
     const dummyEvent = { 
         ...currentEvent, 
         endDate: currentEvent.endDate || new Date().toISOString() 
     } as Event;

     const dummyParticipant: Participant = {
         id: 'preview',
         name: 'Participante Exemplo',
         cpf: '000.000.000-00',
         email: 'exemplo@email.com',
         eventId: 'preview',
         attended: true
     };

     generatePDF(dummyParticipant, dummyEvent, 'PREVIEW-1234');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Gerenciar Eventos</h2>
        {!isEditing && (
          <Button onClick={() => { resetForm(); setIsEditing(true); }}>
            <Plus size={18} className="mr-2" /> Novo Evento
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-4xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h3 className="text-xl font-semibold">{currentEvent.id ? 'Editar Evento' : 'Criar Novo Evento'}</h3>
              <Button type="button" size="sm" variant="secondary" onClick={handlePreview}>
                 <Eye size={16} className="mr-2" /> Pré-visualizar Modelo
              </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título do Evento</label>
                <input 
                  type="text" required
                  className="w-full p-2 border rounded-md"
                  value={currentEvent.title}
                  onChange={e => setCurrentEvent({...currentEvent, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Organizador (Instituição)</label>
                <input 
                  type="text" required
                  className="w-full p-2 border rounded-md"
                  value={currentEvent.organizer}
                  onChange={e => setCurrentEvent({...currentEvent, organizer: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
                <input 
                  type="date" required
                  className="w-full p-2 border rounded-md"
                  value={currentEvent.startDate}
                  onChange={e => setCurrentEvent({...currentEvent, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim</label>
                <input 
                  type="date" required
                  className="w-full p-2 border rounded-md"
                  value={currentEvent.endDate}
                  onChange={e => setCurrentEvent({...currentEvent, endDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Carga Horária (horas)</label>
                <input 
                  type="number" required
                  className="w-full p-2 border rounded-md"
                  value={currentEvent.hours}
                  onChange={e => setCurrentEvent({...currentEvent, hours: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                   <MapPin size={14} className="inline mr-1"/>Local (Cidade - UF)
                </label>
                <input 
                  type="text" required
                  placeholder="Ex: Juazeiro - BA"
                  className="w-full p-2 border rounded-md"
                  value={currentEvent.location}
                  onChange={e => setCurrentEvent({...currentEvent, location: e.target.value})}
                />
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <label className="block text-sm font-medium text-indigo-900 mb-2 flex items-center gap-2">
                 <Palette size={16} /> Selecionar Modelo Base
              </label>
              <select 
                className="w-full p-2 border rounded-md"
                onChange={(e) => handleTemplateSelect(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Escolha um modelo para preencher os campos abaixo...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p className="text-xs text-indigo-700 mt-1">
                Carrega os textos, imagem de Frente/Verso e posições do texto.
              </p>
            </div>

            {/* Background Images Override */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-slate-200 p-4 rounded-md">
                {/* FRONT IMG */}
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Image size={16} /> FRENTE (Certificado)
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'front')} className="text-xs"/>
                    {currentEvent.backgroundImage ? (
                       <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded text-xs text-green-700 flex items-center gap-1">
                          <Eye size={12}/> Imagem carregada
                       </div>
                    ) : (
                       <p className="text-xs text-slate-400 mt-1">Usando padrão vetorial ou vazio.</p>
                    )}
                </div>

                {/* BACK IMG */}
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Image size={16} /> VERSO (Conteúdo)
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'back')} className="text-xs"/>
                    {currentEvent.backImage ? (
                       <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 flex items-center gap-1">
                          <Eye size={12}/> Imagem carregada
                       </div>
                    ) : (
                       <p className="text-xs text-slate-400 mt-1">Usando padrão vetorial ou vazio.</p>
                    )}
                </div>
            </div>

            {/* Signature Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
               <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                 <PenTool size={16} /> Dados da Assinatura (Para o Certificado)
               </h4>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Nome do Signatário</label>
                    <input 
                      type="text"
                      placeholder="Ex: Fulano de Tal"
                      className="w-full p-2 border rounded-md bg-white"
                      value={currentEvent.signatureName}
                      onChange={e => setCurrentEvent({...currentEvent, signatureName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Cargo / Função</label>
                    <input 
                      type="text"
                      placeholder="Ex: Diretor Geral"
                      className="w-full p-2 border rounded-md bg-white"
                      value={currentEvent.signatureRole}
                      onChange={e => setCurrentEvent({...currentEvent, signatureRole: e.target.value})}
                    />
                  </div>
               </div>

               {/* Signature Styling */}
               <div className="flex flex-wrap gap-6 items-center mb-4 bg-white p-3 rounded border border-slate-200">
                   <div className="flex items-center gap-2">
                      <ArrowDownUp size={16} className="text-slate-500"/>
                      <span className="text-xs text-slate-600">Posição Y:</span>
                      <input 
                        type="number" 
                        className="w-20 p-1 text-sm border rounded bg-slate-50"
                        value={currentEvent.signatureTextY || 170}
                        onChange={(e) => setCurrentEvent({...currentEvent, signatureTextY: Number(e.target.value)})}
                      />
                   </div>

                    <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                      <Type size={16} className="text-slate-500"/>
                      <span className="text-xs text-slate-600">Tam:</span>
                      <input 
                        type="number" 
                        className="w-14 p-1 text-sm border rounded bg-slate-50"
                        value={currentEvent.signatureTextSize || 11}
                        onChange={(e) => setCurrentEvent({...currentEvent, signatureTextSize: Number(e.target.value)})}
                      />
                   </div>

                   <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                      <ArrowRightToLine size={16} className="text-slate-500"/>
                      <span className="text-xs text-slate-600">Esq:</span>
                      <input 
                        type="number" 
                        className="w-14 p-1 text-sm border rounded bg-slate-50"
                        value={currentEvent.signatureMarginLeft || 0}
                        onChange={(e) => setCurrentEvent({...currentEvent, signatureMarginLeft: Number(e.target.value)})}
                      />
                   </div>
                   <div className="flex items-center gap-2">
                      <ArrowLeftToLine size={16} className="text-slate-500"/>
                      <span className="text-xs text-slate-600">Dir:</span>
                      <input 
                        type="number" 
                        className="w-14 p-1 text-sm border rounded bg-slate-50"
                        value={currentEvent.signatureMarginRight || 0}
                        onChange={(e) => setCurrentEvent({...currentEvent, signatureMarginRight: Number(e.target.value)})}
                      />
                   </div>

                   <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                      <Palette size={16} className="text-slate-500"/>
                      <span className="text-xs text-slate-600">Cor Texto:</span>
                      <input 
                        type="color" 
                        className="w-8 h-8 p-0 border rounded cursor-pointer"
                        value={currentEvent.signatureTextColor || '#000000'}
                        onChange={(e) => setCurrentEvent({...currentEvent, signatureTextColor: e.target.value})}
                      />
                   </div>
               </div>

               {/* Signature Image Input */}
               <div className="bg-white p-3 rounded border border-slate-200">
                   <label className="block text-sm text-slate-700 mb-2 flex items-center gap-2">
                      <Upload size={14} /> Imagem da Assinatura (Opcional)
                   </label>
                   <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      onChange={(e) => handleImageUpload(e, 'signature')} 
                      className="text-xs w-full"
                   />
                   <p className="text-[10px] text-slate-400 mt-1">Recomendado: Imagem PNG com fundo transparente.</p>
                   {currentEvent.signatureImage && (
                      <div className="mt-2">
                         <p className="text-[10px] text-green-600 font-bold mb-1">Preview:</p>
                         <img src={currentEvent.signatureImage} alt="Assinatura Preview" className="h-12 object-contain border border-dashed border-slate-300 bg-slate-100 p-1"/>
                      </div>
                   )}
               </div>
            </div>

            {/* Front Content Section */}
            <div className="border-t pt-6">
              <div className="mb-2">
                 <label className="block text-sm font-medium text-slate-700">Texto Frente do Certificado</label>
              </div>

              {/* Text Configuration Toolbar */}
              <div className="bg-slate-100 p-3 rounded-t-md border border-slate-200 flex flex-wrap gap-4 items-center">
                 {/* Position Y */}
                 <div className="flex items-center gap-2">
                    <ArrowDownUp size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Posição Y:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentEvent.textY || 95}
                      onChange={(e) => setCurrentEvent({...currentEvent, textY: Number(e.target.value)})}
                    />
                 </div>

                 {/* Text Size */}
                 <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                    <Type size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Tam:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentEvent.textSize || 16}
                      onChange={(e) => setCurrentEvent({...currentEvent, textSize: Number(e.target.value)})}
                    />
                 </div>

                 {/* Margins */}
                 <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                    <ArrowRightToLine size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Margem Esq:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentEvent.marginLeft || 30}
                      onChange={(e) => setCurrentEvent({...currentEvent, marginLeft: Number(e.target.value)})}
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <ArrowLeftToLine size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Dir:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentEvent.marginRight || 30}
                      onChange={(e) => setCurrentEvent({...currentEvent, marginRight: Number(e.target.value)})}
                    />
                 </div>

                 {/* Text Color */}
                 <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                    <Palette size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Cor:</span>
                    <input 
                      type="color" 
                      className="w-8 h-8 p-0 border rounded cursor-pointer"
                      value={currentEvent.textColor || '#000000'}
                      onChange={(e) => setCurrentEvent({...currentEvent, textColor: e.target.value})}
                    />
                 </div>

                 {/* Alignment */}
                 <div className="flex items-center gap-1 border-l border-slate-300 pl-4">
                    {['left', 'center', 'justify', 'right'].map(align => (
                        <button 
                          key={align} type="button"
                          onClick={() => setCurrentEvent({...currentEvent, textAlign: align as any})}
                          className={`p-1 rounded hover:bg-slate-200 ${currentEvent.textAlign === align ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500'}`}
                        >
                           {align === 'left' && <AlignLeft size={18} />}
                           {align === 'center' && <AlignCenter size={18} />}
                           {align === 'justify' && <AlignJustify size={18} />}
                           {align === 'right' && <AlignRight size={18} />}
                        </button>
                    ))}
                 </div>
              </div>

              <textarea 
                className="w-full p-3 border border-t-0 rounded-b-md h-32 font-mono text-sm"
                value={currentEvent.templateText}
                placeholder="Certificamos que [NOME_DO_PARTICIPANTE], CPF [CPF]..."
                onChange={e => setCurrentEvent({...currentEvent, templateText: e.target.value})}
              />
              <p className="text-xs text-slate-500 mt-1">
                  Variáveis disponíveis: [NOME_DO_PARTICIPANTE], [CPF], [NOME_EVENTO], [LOCAL], [HORAS].
              </p>
            </div>

             {/* Back Content Section */}
            <div className="border-t pt-6 mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <BookOpen size={16}/> Conteúdo Programático (Verso)
              </label>
              
              <div className="bg-slate-100 p-3 rounded-t-md border border-slate-200 flex flex-wrap gap-4 items-center">
                 <div className="flex items-center gap-2">
                    <ArrowDownUp size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Y:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentEvent.programTextY || 40}
                      onChange={(e) => setCurrentEvent({...currentEvent, programTextY: Number(e.target.value)})}
                    />
                 </div>

                 <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                    <Type size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Tam:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentEvent.programTextSize || 10}
                      onChange={(e) => setCurrentEvent({...currentEvent, programTextSize: Number(e.target.value)})}
                    />
                 </div>

                 <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                    <ArrowRightToLine size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Esq:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentEvent.programMarginLeft || 20}
                      onChange={(e) => setCurrentEvent({...currentEvent, programMarginLeft: Number(e.target.value)})}
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <ArrowLeftToLine size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Dir:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentEvent.programMarginRight || 20}
                      onChange={(e) => setCurrentEvent({...currentEvent, programMarginRight: Number(e.target.value)})}
                    />
                 </div>

                 <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                    <Palette size={16} className="text-slate-500"/>
                    <input 
                      type="color" 
                      className="w-8 h-8 p-0 border rounded cursor-pointer"
                      value={currentEvent.programTextColor || '#000000'}
                      onChange={(e) => setCurrentEvent({...currentEvent, programTextColor: e.target.value})}
                    />
                 </div>

                 <div className="flex items-center gap-1 border-l border-slate-300 pl-4">
                    {['left', 'center', 'justify', 'right'].map(align => (
                        <button 
                          key={align} type="button"
                          onClick={() => setCurrentEvent({...currentEvent, programTextAlign: align as any})}
                          className={`p-1 rounded hover:bg-slate-200 ${currentEvent.programTextAlign === align ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500'}`}
                        >
                           {align === 'left' && <AlignLeft size={18} />}
                           {align === 'center' && <AlignCenter size={18} />}
                           {align === 'justify' && <AlignJustify size={18} />}
                           {align === 'right' && <AlignRight size={18} />}
                        </button>
                    ))}
                 </div>
              </div>

              <textarea 
                className="w-full p-3 border border-t-0 rounded-b-md h-48 font-mono text-sm"
                value={currentEvent.programContent}
                placeholder="MESA I - DATA: ... TEMA: ... PALESTRANTE: ..."
                onChange={e => setCurrentEvent({...currentEvent, programContent: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button type="submit"><Save size={18} className="mr-2" /> Salvar Evento</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {events.length === 0 && <p className="text-slate-500 text-center py-12">Nenhum evento cadastrado.</p>}
          {events.map(ev => (
            <div key={ev.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{ev.title}</h3>
                <p className="text-slate-500 text-sm mb-1">{ev.organizer} • {ev.hours}h</p>
                <div className="flex gap-4 mt-2 text-xs text-slate-400">
                   <span className="flex items-center gap-1"><MapPin size={12}/> {ev.location}</span>
                   <span className="flex items-center gap-1"><PenTool size={12}/> {ev.signatureName}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => handleCopy(ev)} title="Duplicar Evento">
                  <Copy size={16} />
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => { setCurrentEvent(ev); setIsEditing(true); }}>
                  <Edit size={16} />
                </Button>
                <Button type="button" size="sm" variant="danger" onClick={() => handleDelete(ev.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
