
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, Shield, Lock, Mail, User as UserIcon, X, AlertCircle } from 'lucide-react';
import { User, UserRole } from '../types';
import { Button } from '../components/Button';

export default function AdminManager() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    // Carregar Admins
    const savedAdmins = localStorage.getItem('admins');
    if (savedAdmins) {
      setAdmins(JSON.parse(savedAdmins));
    }

    // Carregar usuário atual da sessão
    const session = localStorage.getItem('currentUser');
    if (session) {
      setCurrentUser(JSON.parse(session));
    }
  }, []);

  const saveAdmins = (newList: User[]) => {
    setAdmins(newList);
    localStorage.setItem('admins', JSON.stringify(newList));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.id) {
      // Edit
      const updated = admins.map(a => 
        a.id === formData.id 
          ? { ...a, name: formData.name, email: formData.email, password: formData.password || a.password } 
          : a
      );
      saveAdmins(updated);
    } else {
      // Create
      // Verificar duplicidade de email
      if (admins.some(a => a.email === formData.email)) {
        alert("Este e-mail já está cadastrado.");
        return;
      }

      const newAdmin: User = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: UserRole.ADMIN
      };
      saveAdmins([...admins, newAdmin]);
    }
    setIsEditing(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) {
      alert("Você não pode excluir sua própria conta enquanto está logado.");
      return;
    }
    if (admins.length <= 1) {
      alert("O sistema precisa de pelo menos um administrador.");
      return;
    }
    if (window.confirm("Tem certeza que deseja remover este administrador?")) {
      saveAdmins(admins.filter(a => a.id !== id));
    }
  };

  const startEdit = (admin: User) => {
    setFormData({
      id: admin.id,
      name: admin.name,
      email: admin.email || '',
      password: admin.password || ''
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', email: '', password: '' });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Shield className="text-indigo-600" /> Gestão de Administradores
            </h2>
            <p className="text-slate-500 mt-1">Cadastre e gerencie quem tem acesso ao painel administrativo.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => { resetForm(); setIsEditing(true); }}>
            <Plus size={18} className="mr-2" /> Novo Admin
          </Button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 max-w-2xl mx-auto mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h3 className="text-xl font-semibold text-indigo-900">{formData.id ? 'Editar Administrador' : 'Cadastrar Novo Administrador'}</h3>
              <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={24} />
              </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-400" size={18}/>
                <input 
                  type="text" required
                  className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18}/>
                <input 
                  type="email" required
                  className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18}/>
                <input 
                  type="text" required={!formData.id}
                  className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder={formData.id ? "Deixe em branco para manter a atual" : "Crie uma senha forte"}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">A senha é visível aqui para facilitar o gerenciamento inicial.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button type="submit"><Save size={18} className="mr-2" /> Salvar Administrador</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Nome</th>
              <th className="p-4 font-semibold text-slate-600">E-mail</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map(admin => (
              <tr key={admin.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                   <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                      {admin.name.charAt(0).toUpperCase()}
                   </div>
                   {admin.name}
                   {admin.id === currentUser?.id && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full ml-2">Você</span>}
                </td>
                <td className="p-4 text-slate-600">{admin.email}</td>
                <td className="p-4">
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ativo
                   </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); startEdit(admin); }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                        title="Editar"
                    >
                        <Edit size={16} />
                    </button>
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDelete(admin.id); }}
                        className={`p-2 rounded transition-colors cursor-pointer ${admin.id === currentUser?.id ? 'text-slate-300 cursor-not-allowed opacity-50' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                        title="Excluir"
                        disabled={admin.id === currentUser?.id}
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
