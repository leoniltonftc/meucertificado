
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, Image, ArrowDownUp, AlignCenter, AlignLeft, AlignJustify, AlignRight, Palette, ArrowRightToLine, ArrowLeftToLine } from 'lucide-react';
import { CertificateTemplate } from '../types';
import { Button } from '../components/Button';

export default function TemplateManager() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<CertificateTemplate>>({
    name: '',
    frontText: 'Certificamos que [NOME_DO_PARTICIPANTE], CPF: [CPF] participou de 100,00% do evento [NOME_EVENTO], realizado em [LOCAL].',
    backText: 'MESA I\nTEMA: ...\nPALESTRANTE: ...',
    backgroundImage: '',
    backImage: '',
    // Front Defaults
    textY: 95,
    marginLeft: 30,
    marginRight: 30,
    textAlign: 'justify',
    textColor: '#000000',
    // Back Defaults
    programTextY: 40,
    programMarginLeft: 20,
    programMarginRight: 20,
    programTextAlign: 'left',
    programTextColor: '#000000',
    // Signature Defaults
    signatureTextY: 170,
    signatureTextColor: '#000000'
  });

  useEffect(() => {
    const saved = localStorage.getItem('certificate_templates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    } else {
      // Seed default
      const defaultTemplate = {
        id: 'default',
        name: 'Modelo Padrão (Azul)',
        frontText: 'Certificamos que [NOME_DO_PARTICIPANTE], CPF: [CPF] participou de 100,00% do evento [NOME_EVENTO].',
        backText: 'CONTEÚDO PROGRAMÁTICO PADRÃO',
        textY: 95,
        marginLeft: 30,
        marginRight: 30,
        textAlign: 'justify' as const,
        textColor: '#000000',
        programTextY: 40,
        programMarginLeft: 20,
        programMarginRight: 20,
        programTextAlign: 'left' as const,
        programTextColor: '#000000',
        signatureTextY: 170,
        signatureTextColor: '#000000'
      };
      setTemplates([defaultTemplate]);
      localStorage.setItem('certificate_templates', JSON.stringify([defaultTemplate]));
    }
  }, []);

  const saveTemplates = (newTemplates: CertificateTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('certificate_templates', JSON.stringify(newTemplates));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTemplate.id) {
      const updated = templates.map(t => t.id === currentTemplate.id ? { ...t, ...currentTemplate } as CertificateTemplate : t);
      saveTemplates(updated);
    } else {
      const newTemplate = { ...currentTemplate, id: crypto.randomUUID() } as CertificateTemplate;
      saveTemplates([...templates, newTemplate]);
    }
    setIsEditing(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentTemplate({ 
      name: '', 
      frontText: 'Certificamos que [NOME_DO_PARTICIPANTE], CPF: [CPF] participou...', 
      backText: 'MESA I...',
      backgroundImage: '',
      backImage: '',
      textY: 95,
      marginLeft: 30,
      marginRight: 30,
      textAlign: 'justify',
      textColor: '#000000',
      programTextY: 40,
      programMarginLeft: 20,
      programMarginRight: 20,
      programTextAlign: 'left',
      programTextColor: '#000000',
      signatureTextY: 170,
      signatureTextColor: '#000000'
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir este modelo?')) {
      saveTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'front') {
            setCurrentTemplate({ ...currentTemplate, backgroundImage: reader.result as string });
        } else {
            setCurrentTemplate({ ...currentTemplate, backImage: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Modelos de Certificado</h2>
        {!isEditing && (
          <Button onClick={() => { resetForm(); setIsEditing(true); }}>
            <Plus size={18} className="mr-2" /> Novo Modelo
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-4xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h3 className="text-xl font-semibold">{currentTemplate.id ? 'Editar Modelo' : 'Criar Novo Modelo'}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Modelo</label>
              <input 
                type="text" required
                className="w-full p-2 border rounded-md"
                value={currentTemplate.name}
                onChange={e => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                placeholder="Ex: Modelo Congresso 2025"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FRENTE */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="block text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                      <Image size={16} /> Imagem de Fundo - FRENTE
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'front')}
                      className="mb-2 text-sm"
                    />
                    <p className="text-xs text-slate-500 mb-2">
                      Substitui o design padrão da frente. Formato A4 Paisagem.
                    </p>
                    {currentTemplate.backgroundImage && (
                      <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border shadow-sm group bg-white">
                        <img src={currentTemplate.backgroundImage} className="w-full h-full object-cover" alt="Preview Frente" />
                        <button 
                          type="button"
                          onClick={() => setCurrentTemplate({...currentTemplate, backgroundImage: ''})}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14}/>
                        </button>
                        <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">FRENTE</span>
                      </div>
                    )}
                </div>

                {/* VERSO */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="block text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                      <Image size={16} /> Imagem de Fundo - VERSO
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'back')}
                      className="mb-2 text-sm"
                    />
                    <p className="text-xs text-slate-500 mb-2">
                      Opcional. Se não enviado, será usado o quadro padrão.
                    </p>
                    {currentTemplate.backImage && (
                      <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border shadow-sm group bg-white">
                        <img src={currentTemplate.backImage} className="w-full h-full object-cover" alt="Preview Verso" />
                        <button 
                          type="button"
                          onClick={() => setCurrentTemplate({...currentTemplate, backImage: ''})}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14}/>
                        </button>
                        <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">VERSO</span>
                      </div>
                    )}
                </div>
            </div>

            {/* FRONT TEXT */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-slate-700">Configuração do Texto (Frente)</label>
              </div>
              
              <div className="bg-slate-100 p-3 rounded-t-md border border-slate-200 flex flex-wrap gap-4 items-center">
                 {/* Position Y */}
                 <div className="flex items-center gap-2">
                    <ArrowDownUp size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Y:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentTemplate.textY || 95}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, textY: Number(e.target.value)})}
                    />
                 </div>

                 {/* Margins */}
                 <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                    <ArrowRightToLine size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Esq:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentTemplate.marginLeft || 30}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, marginLeft: Number(e.target.value)})}
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <ArrowLeftToLine size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Dir:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentTemplate.marginRight || 30}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, marginRight: Number(e.target.value)})}
                    />
                 </div>

                 {/* Text Color */}
                 <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                    <Palette size={16} className="text-slate-500"/>
                    <input 
                      type="color" 
                      className="w-8 h-8 p-0 border rounded cursor-pointer"
                      value={currentTemplate.textColor || '#000000'}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, textColor: e.target.value})}
                    />
                 </div>

                 {/* Alignment */}
                 <div className="flex items-center gap-1 border-l border-slate-300 pl-4">
                    {['left', 'center', 'justify', 'right'].map((align) => (
                        <button 
                          key={align}
                          type="button"
                          onClick={() => setCurrentTemplate({...currentTemplate, textAlign: align as any})}
                          className={`p-1 rounded hover:bg-slate-200 ${currentTemplate.textAlign === align ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500'}`}
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
                value={currentTemplate.frontText}
                onChange={e => setCurrentTemplate({...currentTemplate, frontText: e.target.value})}
              />
            </div>

            {/* BACK TEXT (PROGRAM) */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-slate-700">Configuração Conteúdo Programático (Verso)</label>
              </div>
              
              <div className="bg-slate-100 p-3 rounded-t-md border border-slate-200 flex flex-wrap gap-4 items-center">
                 <div className="flex items-center gap-2">
                    <ArrowDownUp size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Y:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentTemplate.programTextY || 40}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, programTextY: Number(e.target.value)})}
                    />
                 </div>

                 <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                    <ArrowRightToLine size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Esq:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentTemplate.programMarginLeft || 20}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, programMarginLeft: Number(e.target.value)})}
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <ArrowLeftToLine size={16} className="text-slate-500"/>
                    <span className="text-xs text-slate-600">Dir:</span>
                    <input 
                      type="number" 
                      className="w-14 p-1 text-sm border rounded"
                      value={currentTemplate.programMarginRight || 20}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, programMarginRight: Number(e.target.value)})}
                    />
                 </div>

                 <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                    <Palette size={16} className="text-slate-500"/>
                    <input 
                      type="color" 
                      className="w-8 h-8 p-0 border rounded cursor-pointer"
                      value={currentTemplate.programTextColor || '#000000'}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, programTextColor: e.target.value})}
                    />
                 </div>

                 <div className="flex items-center gap-1 border-l border-slate-300 pl-4">
                    {['left', 'center', 'justify', 'right'].map((align) => (
                        <button 
                          key={align}
                          type="button"
                          onClick={() => setCurrentTemplate({...currentTemplate, programTextAlign: align as any})}
                          className={`p-1 rounded hover:bg-slate-200 ${currentTemplate.programTextAlign === align ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500'}`}
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
                value={currentTemplate.backText}
                onChange={e => setCurrentTemplate({...currentTemplate, backText: e.target.value})}
              />
            </div>

             {/* SIGNATURE CONFIG */}
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-3">Posição e Estilo da Assinatura</h4>
                <div className="flex flex-wrap gap-6 items-center">
                   <div className="flex items-center gap-2">
                      <ArrowDownUp size={16} className="text-slate-500"/>
                      <span className="text-xs text-slate-600">Posição Y:</span>
                      <input 
                        type="number" 
                        className="w-20 p-1 text-sm border rounded bg-white"
                        value={currentTemplate.signatureTextY || 170}
                        onChange={(e) => setCurrentTemplate({...currentTemplate, signatureTextY: Number(e.target.value)})}
                      />
                   </div>

                   <div className="flex items-center gap-2">
                      <Palette size={16} className="text-slate-500"/>
                      <span className="text-xs text-slate-600">Cor Texto:</span>
                      <input 
                        type="color" 
                        className="w-8 h-8 p-0 border rounded cursor-pointer"
                        value={currentTemplate.signatureTextColor || '#000000'}
                        onChange={(e) => setCurrentTemplate({...currentTemplate, signatureTextColor: e.target.value})}
                      />
                   </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button type="submit"><Save size={18} className="mr-2" /> Salvar Modelo</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800">{t.name}</h3>
                <div className="flex gap-1">
                   {t.backgroundImage && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold">FRENTE</span>}
                   {t.backImage && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">VERSO</span>}
                </div>
              </div>
              <div className="text-xs text-slate-400 mb-4 grid grid-cols-2 gap-2">
                 <span>Y Frente: {t.textY || 95}mm</span>
                 <span>Y Verso: {t.programTextY || 40}mm</span>
                 <span>Y Assinatura: {t.signatureTextY || 170}mm</span>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => { setCurrentTemplate(t); setIsEditing(true); }}>
                  <Edit size={16} /> Editar
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>
                  <Trash2 size={16} /> Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}