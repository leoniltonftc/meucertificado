
import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import { Button } from '../components/Button';
import { ShieldCheck, UserCircle, LayoutDashboard, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  
  // Estados do Formulário
  const [loginMode, setLoginMode] = useState<'SELECT' | 'CPF' | 'ADMIN'>('SELECT');
  const [cpf, setCpf] = useState('');
  
  // Estados Admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Inicializar Admin padrão se não existir
  useEffect(() => {
    const storedAdmins = localStorage.getItem('admins');
    if (!storedAdmins || JSON.parse(storedAdmins).length === 0) {
      const defaultAdmin: User = {
        id: 'admin-default',
        name: 'Administrador Padrão',
        email: 'admin@admin.com',
        password: '123456',
        role: UserRole.ADMIN
      };
      localStorage.setItem('admins', JSON.stringify([defaultAdmin]));
    }
  }, []);

  // Login do Participante (CPF)
  const handleCpfLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length < 11) {
      alert("Por favor, digite um CPF válido.");
      return;
    }

    onLogin({
      id: cleanCpf,
      name: 'Participante',
      cpf: cleanCpf,
      role: UserRole.PARTICIPANT
    });
  };

  // Login do Administrador (Email/Senha)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const storedAdmins: User[] = JSON.parse(localStorage.getItem('admins') || '[]');
      const foundAdmin = storedAdmins.find(
        a => a.email === email && a.password === password
      );

      if (foundAdmin) {
        onLogin({
          id: foundAdmin.id,
          name: foundAdmin.name,
          email: foundAdmin.email,
          role: UserRole.ADMIN
        });
      } else {
        setError('Credenciais inválidas. Verifique e-mail e senha.');
        setIsLoading(false);
      }
    }, 600);
  };

  const formatCpfDisplay = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-indigo-900 transform -skew-y-3 origin-top-left z-0"></div>

      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-8 relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white border-4 border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Portal de Acesso</h2>
          <p className="mt-2 text-slate-500">Sistema de Certificados Inteligente</p>
        </div>

        {/* MODO SELEÇÃO */}
        {loginMode === 'SELECT' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-center text-sm text-slate-400 uppercase tracking-wider font-semibold mb-6">Escolha seu perfil</p>
            
            <div 
              onClick={() => setLoginMode('ADMIN')}
              className="p-5 border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md hover:bg-indigo-50 cursor-pointer transition-all group flex items-center gap-4"
            >
              <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-700">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Administrador</h3>
                <p className="text-xs text-slate-500">Gestão de eventos e emissão</p>
              </div>
              <ArrowRight className="ml-auto text-slate-300 group-hover:text-indigo-600" size={20}/>
            </div>

            <div 
              onClick={() => setLoginMode('CPF')}
              className="p-5 border border-slate-200 rounded-xl hover:border-green-500 hover:shadow-md hover:bg-green-50 cursor-pointer transition-all group flex items-center gap-4"
            >
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors text-green-700">
                <UserCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Participante / Aluno</h3>
                <p className="text-xs text-slate-500">Baixar certificados via CPF</p>
              </div>
              <ArrowRight className="ml-auto text-slate-300 group-hover:text-green-600" size={20}/>
            </div>
          </div>
        )}

        {/* MODO LOGIN PARTICIPANTE */}
        {loginMode === 'CPF' && (
          <form onSubmit={handleCpfLogin} className="space-y-5 animate-fade-in">
             <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Área do Aluno</h3>
                <p className="text-sm text-slate-500">Informe seu documento para prosseguir</p>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">CPF do Participante</label>
               <div className="relative">
                 <UserCircle className="absolute left-3 top-3.5 text-slate-400" size={20}/>
                 <input 
                   type="text"
                   className="w-full pl-10 p-3 border border-slate-300 rounded-lg font-mono text-lg tracking-wide focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                   placeholder="000.000.000-00"
                   value={cpf}
                   onChange={(e) => setCpf(formatCpfDisplay(e.target.value))}
                   maxLength={14}
                   autoFocus
                 />
               </div>
             </div>

             <Button variant="primary" className="w-full bg-green-600 hover:bg-green-700 text-white py-3" type="submit">
               Acessar Meus Certificados
             </Button>
             
             <button 
               type="button" 
               onClick={() => setLoginMode('SELECT')}
               className="w-full text-center text-sm text-slate-400 hover:text-slate-700 mt-2"
             >
               Voltar para seleção
             </button>
          </form>
        )}

        {/* MODO LOGIN ADMIN */}
        {loginMode === 'ADMIN' && (
          <form onSubmit={handleAdminLogin} className="space-y-5 animate-fade-in">
             <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Acesso Administrativo</h3>
                <p className="text-sm text-slate-500">Entre com suas credenciais de gestão</p>
             </div>

             {error && (
               <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
                 <AlertCircle size={16} /> {error}
               </div>
             )}

             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                   <input 
                     type="email"
                     className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                     placeholder="admin@empresa.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     autoFocus
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                   <input 
                     type="password"
                     className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                 </div>
               </div>
             </div>

             <Button 
                variant="primary" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 shadow-lg shadow-indigo-200" 
                type="submit"
                isLoading={isLoading}
             >
               Entrar no Painel
             </Button>
             
             <button 
               type="button" 
               onClick={() => { setLoginMode('SELECT'); setError(''); setEmail(''); setPassword(''); }}
               className="w-full text-center text-sm text-slate-400 hover:text-slate-700 mt-2"
             >
               Voltar para seleção
             </button>
          </form>
        )}

        <div className="pt-6 border-t border-slate-100">
           <Button 
            variant="outline" 
            className="w-full justify-center text-slate-500 border-slate-200 hover:bg-slate-50"
            onClick={() => navigate('/validate')}
           >
             <ShieldCheck size={16} className="mr-2"/> Validar Autenticidade Pública
           </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
