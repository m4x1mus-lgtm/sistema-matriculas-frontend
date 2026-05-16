import { useEffect, useState } from 'react';
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import api from '../../services/api';
import { Usuario } from '../../types';
import { formatDate } from '../../utils';
import Modal from '../../components/shared/Modal';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const roleLabel: Record<string, string> = { ADMIN: 'Administrador', SECRETARIA: 'Secretaria', PROFESSOR: 'Professor' };
const roleColor: Record<string, string> = { ADMIN: 'badge-red', SECRETARIA: 'badge-blue', PROFESSOR: 'badge-green' };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', role: 'SECRETARIA' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const carregar = async () => {
    setIsLoading(true);
    api.get('/usuarios').then(({ data }) => setUsuarios(data.data)).finally(() => setIsLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const toggleAtivo = async (id: string) => {
    try {
      await api.patch(`/usuarios/${id}/toggle-ativo`);
      toast('Status atualizado');
      carregar();
    } catch {
      toast('Erro ao alterar status', 'error');
    }
  };

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/usuarios', form);
      toast('Usuário criado com sucesso!');
      setShowForm(false);
      setForm({ nome: '', email: '', senha: '', role: 'SECRETARIA' });
      carregar();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Erro ao criar usuário', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header title="Usuários do Sistema" subtitle="Gerencie o acesso da equipe" />

      <div className="mt-6">
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={16} />Novo Usuário
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Criado em</th><th className="text-right">Ações</th></tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6}><LoadingSpinner /></td></tr>
              ) : usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-gray-900">{u.nome}</td>
                  <td className="text-gray-500">{u.email}</td>
                  <td><span className={roleColor[u.role]}>{roleLabel[u.role]}</span></td>
                  <td>
                    <span className={u.ativo ? 'badge-green' : 'badge-gray'}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="text-gray-500">{formatDate((u as any).createdAt)}</td>
                  <td>
                    <div className="flex justify-end">
                      <button onClick={() => toggleAtivo(u.id)} title={u.ativo ? 'Desativar' : 'Ativar'} className="btn-ghost btn-sm p-1.5">
                        {u.ativo ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} className="text-gray-400" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Usuário" size="sm">
        <form onSubmit={handleCriar} className="space-y-4">
          <div>
            <label className="label">Nome</label>
            <input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="input" required />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input" required />
          </div>
          <div>
            <label className="label">Senha</label>
            <input type="password" value={form.senha} onChange={(e) => setForm((p) => ({ ...p, senha: e.target.value }))} className="input" required minLength={6} />
          </div>
          <div>
            <label className="label">Perfil</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="input">
              <option value="SECRETARIA">Secretaria</option>
              <option value="PROFESSOR">Professor</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Criando...' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
