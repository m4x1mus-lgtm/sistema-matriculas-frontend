import { useEffect, useState } from 'react';
import { Plus, Eye, FileText, Ban, PauseCircle } from 'lucide-react';
import api from '../../services/api';
import { Matricula } from '../../types';
import { formatDate, formatCurrency, getStatusMatriculaColor, modalidadeLabel } from '../../utils';
import Pagination from '../../components/shared/Pagination';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Header from '../../components/layout/Header';
import NovaMatricula from './NovaMatricula';
import MatriculaDetalhes from './MatriculaDetalhes';
import AlterarStatusModal from './AlterarStatusModal';
import { useToast } from '../../context/ToastContext';

export default function Matriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showNova, setShowNova] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showAlterarStatus, setShowAlterarStatus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [novoStatus, setNovoStatus] = useState<string>('');
  const { toast } = useToast();

  const carregar = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (busca) params.set('busca', busca);
      if (filtroStatus) params.set('status', filtroStatus);
      const { data } = await api.get(`/matriculas?${params}`);
      setMatriculas(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast('Erro ao carregar matrículas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { carregar(); }, [page, filtroStatus]);

  const handleBusca = (e: React.FormEvent) => { e.preventDefault(); setPage(1); carregar(); };

  const abrirAlterarStatus = (id: string, status: string) => {
    setSelectedId(id);
    setNovoStatus(status);
    setShowAlterarStatus(true);
  };

  return (
    <div>
      <Header title="Matrículas" subtitle={`${total} matrículas registradas`} />

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <form onSubmit={handleBusca} className="flex gap-2 flex-1">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou nº de matrícula..."
                className="input flex-1"
              />
              <button type="submit" className="btn-primary">Buscar</button>
            </form>
            <select value={filtroStatus} onChange={(e) => { setFiltroStatus(e.target.value); setPage(1); }} className="input max-w-[160px]">
              <option value="">Todos os status</option>
              <option value="ATIVA">Ativa</option>
              <option value="TRANCADA">Trancada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>
          </div>
          <button onClick={() => setShowNova(true)} className="btn-primary">
            <Plus size={16} />Nova Matrícula
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nº Matrícula</th>
                <th>Estudante</th>
                <th>Turma</th>
                <th>Modalidade</th>
                <th>Mensalidade</th>
                <th>Data</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8}><LoadingSpinner /></td></tr>
              ) : matriculas.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">Nenhuma matrícula encontrada</td></tr>
              ) : (
                matriculas.map((m) => (
                  <tr key={m.id}>
                    <td className="font-mono text-primary-600 font-medium">{m.numeroMatricula}</td>
                    <td className="font-medium text-gray-900">{m.estudante?.nomeCompleto}</td>
                    <td className="text-gray-600">{m.turma?.nome}</td>
                    <td><span className="badge-blue text-xs">{m.turma ? modalidadeLabel[m.turma.modalidade] : '---'}</span></td>
                    <td>{formatCurrency(m.valorFinalMensalidade)}</td>
                    <td className="text-gray-500">{formatDate(m.dataMatricula)}</td>
                    <td><span className={getStatusMatriculaColor(m.status)}>{m.status}</span></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelectedId(m.id); setShowDetalhes(true); }} title="Detalhes" className="btn-ghost btn-sm p-1.5">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => window.open(`/api/relatorios/contrato/${m.id}`, '_blank')} title="Contrato PDF" className="btn-ghost btn-sm p-1.5">
                          <FileText size={15} />
                        </button>
                        {m.status === 'ATIVA' && (
                          <>
                            <button onClick={() => abrirAlterarStatus(m.id, 'TRANCADA')} title="Trancar" className="btn-ghost btn-sm p-1.5 text-yellow-600">
                              <PauseCircle size={15} />
                            </button>
                            <button onClick={() => abrirAlterarStatus(m.id, 'CANCELADA')} title="Cancelar" className="btn-ghost btn-sm p-1.5 text-red-500">
                              <Ban size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!isLoading && total > 0 && (
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={20} onPageChange={setPage} />
          )}
        </div>
      </div>

      {showNova && <NovaMatricula onClose={() => { setShowNova(false); carregar(); }} />}
      {showDetalhes && selectedId && (
        <MatriculaDetalhes matriculaId={selectedId} onClose={() => setShowDetalhes(false)} />
      )}
      {showAlterarStatus && selectedId && (
        <AlterarStatusModal
          matriculaId={selectedId}
          novoStatus={novoStatus}
          onClose={() => { setShowAlterarStatus(false); carregar(); }}
        />
      )}
    </div>
  );
}
