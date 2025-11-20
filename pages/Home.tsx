
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileBadge, Zap, Users, ArrowRight, LayoutTemplate, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { User } from '../types';

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header / Nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-800 font-bold text-xl">
            <FileBadge className="w-8 h-8 text-indigo-600" />
            CertificadoPro AI
          </div>
          <div className="flex items-center gap-4">
            <Link to="/validate" className="text-slate-600 hover:text-indigo-600 font-medium text-sm hidden md:block">
              Validar Certificado
            </Link>
            {user ? (
               <Link to={user.role === 'ADMIN' ? "/admin" : "/my-certificates"}>
                 <Button>Ir para Painel</Button>
               </Link>
            ) : (
               <Link to="/login">
                 <Button variant="primary">Acessar Sistema</Button>
               </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-indigo-900 text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-800 border border-indigo-700 text-indigo-300 text-xs font-bold tracking-wider uppercase mb-6 animate-fade-in">
             Plataforma Inteligente de Gestão
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Gestão de Eventos e <br/>
            <span className="text-indigo-400">Certificados Simplificada</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-200 max-w-2xl mx-auto mb-10">
            Automatize a emissão de certificados com Inteligência Artificial. 
            Modelos personalizados, importação inteligente de listas e validação segura.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to="/login">
               <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-900 hover:bg-indigo-50 font-bold">
                 Começar Agora <ArrowRight size={20} className="ml-2" />
               </Button>
             </Link>
             <Link to="/validate">
               <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-indigo-400 hover:bg-indigo-800 hover:text-white">
                 <ShieldCheck size={20} className="mr-2" /> Validar Código
               </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Recursos Poderosos</h2>
            <p className="text-slate-500 mt-4">Tudo o que você precisa para gerenciar a certificação do seu evento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">IA Generativa</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Utilize o Google Gemini para gerar textos formais, extrair dados de listas bagunçadas e preencher informações automaticamente.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <LayoutTemplate size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Modelos Flexíveis</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Crie templates ilimitados. Faça upload do seu design (Frente/Verso), configure margens, cores e posicionamento do texto.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Autenticidade Garantida</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Cada certificado possui um hash único e QR Code (simulado) para validação pública instantânea.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">Como Funciona?</h2>
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">1</div>
                        <div>
                           <h4 className="font-bold text-slate-800">Crie o Evento</h4>
                           <p className="text-sm text-slate-600">Defina datas, carga horária e selecione um modelo visual.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">2</div>
                        <div>
                           <h4 className="font-bold text-slate-800">Importe Participantes</h4>
                           <p className="text-sm text-slate-600">Cole sua lista do Excel ou Sheets. Nossa IA organiza os dados para você.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">3</div>
                        <div>
                           <h4 className="font-bold text-slate-800">Distribuição Automática</h4>
                           <p className="text-sm text-slate-600">Os alunos acessam o portal com CPF e baixam o PDF pronto.</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-4 border-b pb-4">
                     <CheckCircle className="text-green-500" />
                     <span className="font-bold text-slate-800">Exemplo de Sucesso</span>
                  </div>
                  <div className="space-y-3">
                     <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                     <div className="h-2 bg-slate-100 rounded w-full"></div>
                     <div className="h-2 bg-slate-100 rounded w-5/6"></div>
                     <div className="h-24 bg-indigo-50 rounded-lg border border-indigo-100 mt-4 flex items-center justify-center text-indigo-300 font-mono text-xs">
                        PREVIEW DO CERTIFICADO
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
              <FileBadge className="w-6 h-6" /> CertificadoPro AI
            </div>
            <p className="text-sm">
              Transformando a gestão acadêmica e corporativa com tecnologia de ponta.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white">Login Admin</Link></li>
              <li><Link to="/login" className="hover:text-white">Área do Aluno</Link></li>
              <li><Link to="/validate" className="hover:text-white">Validação</Link></li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-bold mb-4">Contato</h4>
             <p className="text-sm">suporte@certificadopro.com.br</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
           &copy; 2025 CertificadoPro AI. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
