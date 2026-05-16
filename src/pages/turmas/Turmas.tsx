import { useEffect, useState } from 'react';
import { Plus, Users, FileText, Pencil, Eye } from 'lucide-react';
import api from '../../services/api';
import { Turma } from '../../types';
import { modalidadeLabel, turnoLabel, getStatusTurmaColor, formatCurrency, cn } from '../../utils';
import Pagination from '../../components/shared/Pagination';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Header from '../../components/layout/Header';
import TurmaForm from './TurmaForm';
import TurmaDetalhes from './TurmaDetalhes';
import { useToast } from '../../context/ToastContext';

export default function Turmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtroModalidade, setFiltroModalidade] = useState('');
  const { toast } = useToast();

  const carregar = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (filtroModalidade) params.set('modalidade', filtroModalidade);
      const { data } = await api.get(`/turmas?${params}`);
      setTurmas(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast('Erro ao carregar turmas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { carregar(); }, [page, filtroModalidade]);

  return (
    <div>
      <Header title="Turmas" subtitle={`${total} turmas cadastradas`} />

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <select
            value={filtroModalidade}
            onChange={(e) => { setFiltroModalidade(e.target.value); setPage(1); }}
            className="input max-w-xs"
          >
            <option value="">Todas as modalidades</option>
            {Object.entries(modalidadeLabel).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button onClick={() => { setSelectedId(null); setShowForm(true); }} className="btn-primary">
            <Plus size={16} />Nova Turma
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Turma</th>
                <th>Modalidade</th>
                <th>Turno</th>
                <th>Horário</th>
                <th>Alunos</th>
                <th>Mensalidade</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8}><LoadingSpinner /></td></tr>
              ) : turmas.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">Nenhuma turma encontrada</td></tr>
              ) : (
                turmas.map((t) => {
                  const ocup = ((t.alunosAtivos || 0) / t.capacidadeMaxima) * 100;
                  return (
                    <tr key={t.id}>
                      <td className="font-medium text-gray-900">{t.nome}</td>
                      <td><span className="badge-blue">{modalidadeLabel[t.modalidade]}</span></td>
                      <td>{turnoLabel[t.turno]}</td>
                      <td className="text-gray-500">{t.horarioInicio} — {t.horarioFim}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-sm font-medium', ocup >= 100 ? 'text-red-600' : ocup >= 80 ? 'text-yellow-600' : 'text-green-600')}>
                            {t.alunosAtivos || 0}/{t.capacidadeMaxima}
                          </span>
                          {ocup >= 100 && <span className="badge-red text-xs">Lotado</span>}
                        </div>
                      </td>
                      <td>{formatCurrency(t.valorMensalidade)}</td>
                      <td><span className={getStatusTurmaColor(t.status)}>{t.status}</span></td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedId(t.id); setShowDetalhes(true); }} title="Ver alunos" className="btn-ghost btn-sm p-1.5">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => { setSelectedId(t.id); setShowForm(true); }} title="Editar" className="btn-ghost btn-sm p-1.5">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => window.open(`/api/relatorios/chamada/${t.id}`, '_blank')} title="Lista de chamada PDF" className="btn-ghost btn-sm p-1.5">
                            <FileText size={15} />
                          </button>
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
        <TurmaForm turmaId={selectedId} onClose={() => { setShowForm(false); carregar(); }} />
      )}
      {showDetalhes && selectedId && (
        <TurmaDetalhes turmaId={selectedId} onClose={() => setShowDetalhes(false)} />
      )}
    </div>
  );
}
