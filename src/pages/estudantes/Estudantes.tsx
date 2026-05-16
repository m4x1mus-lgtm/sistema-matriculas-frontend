import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Pencil, FileText, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Estudante } from '../../types';
import { formatDate, getStatusMatriculaColor } from '../../utils';
import Pagination from '../../components/shared/Pagination';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Header from '../../components/layout/Header';
import EstudanteForm from './EstudanteForm';
import EstudanteDetalhes from './EstudanteDetalhes';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function Estudantes() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busca, setBusca] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Estudante | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const carregar = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (busca) params.set('busca', busca);
      const { data } = await api.get(`/estudantes?${params}`);
      setEstudantes(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast('Erro ao carregar estudantes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { carregar(); }, [page, busca]);

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    carregar();
  };

  const abrirDetalhes = (id: string) => { setSelectedId(id); setShowDetalhes(true); };
  const abrirEdicao = (id: string) => { setSelectedId(id); setShowForm(true); };
  const abrirNovo = () => { setSelectedId(null); setShowForm(true); };

  const gerarFicha = (id: string) => {
    window.open(`/api/relatorios/ficha/${id}`, '_blank');
  };

  const confirmarDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/estudantes/${deleteTarget.id}`);
      toast(`Estudante "${deleteTarget.nomeCompleto}" removido com sucesso.`);
      setDeleteTarget(null);
      carregar();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Erro ao remover estudante', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <Header title="Estudantes" subtitle={`${total} estudantes cadastrados`} />

      <div className="mt-6">
        {/* Barra de ações */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <form onSubmit={handleBusca} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, CPF ou matrícula..."
                className="input pl-9"
              />
            </div>
            <button type="submit" className="btn-primary">Buscar</button>
          </form>
          <button onClick={abrirNovo} className="btn-primary">
            <Plus size={16} />
            Novo Estudante
          </button>
        </div>

        {/* Tabela */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Escola</th>
                <th>Matrícula Ativa</th>
                <th>Cadastro</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7}><LoadingSpinner /></td></tr>
              ) : estudantes.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhum estudante encontrado</td></tr>
              ) : (
                estudantes.map((e) => {
                  const mat = e.matriculas?.[0];
                  return (
                    <tr key={e.id}>
                      <td className="font-medium text-gray-900">{e.nomeCompleto}</td>
                      <td className="text-gray-500">{e.cpf || '---'}</td>
                      <td>{e.telefone || '---'}</td>
                      <td className="text-gray-500 max-w-[150px] truncate">{e.escolaOrigem || '---'}</td>
                      <td>
                        {mat ? (
                          <span className={getStatusMatriculaColor(mat.status)}>
                            {mat.turma?.nome || mat.status}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Sem matrícula</span>
                        )}
                      </td>
                      <td className="text-gray-500">{formatDate(e.createdAt)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => abrirDetalhes(e.id)} title="Ver detalhes" className="btn-ghost btn-sm p-1.5">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => abrirEdicao(e.id)} title="Editar" className="btn-ghost btn-sm p-1.5">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => gerarFicha(e.id)} title="Gerar ficha PDF" className="btn-ghost btn-sm p-1.5">
                            <FileText size={15} />
                          </button>
                          {user?.role === 'ADMIN' && (
                            <button
                              onClick={() => setDeleteTarget(e)}
                              title="Remover estudante"
                              className="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {!isLoading && total > 0 && (
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={20} onPageChange={setPage} />
          )}
        </div>
      </div>

      {showForm && (
        <EstudanteForm
          estudanteId={selectedId}
          onClose={() => { setShowForm(false); carregar(); }}
        />
      )}
      {showDetalhes && selectedId && (
        <EstudanteDetalhes
          estudanteId={selectedId}
          onClose={() => setShowDetalhes(false)}
          onEditar={() => { setShowDetalhes(false); setShowForm(true); }}
        />
      )}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmarDelete}
        isLoading={isDeleting}
        title="Remover Estudante"
        message={`Tem certeza que deseja remover "${deleteTarget?.nomeCompleto}"? Esta ação não pode ser desfeita e removerá todos os dados vinculados.`}
        confirmLabel="Sim, remover"
        variant="danger"
      />
    </div>
  );
}
