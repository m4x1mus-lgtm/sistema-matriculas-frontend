import { useEffect, useState } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import api from '../../services/api';
import { Pagamento } from '../../types';
import { formatDate, formatCurrency, getStatusPagamentoColor, formatMesReferencia, mesAtual } from '../../utils';
import Pagination from '../../components/shared/Pagination';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Header from '../../components/layout/Header';
import PagarModal from './PagarModal';
import { useToast } from '../../context/ToastContext';

function KPICard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-xl font-bold text-gray-900 mt-0.5">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function Financeiro() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroMes, setFiltroMes] = useState(mesAtual());
  const [resumo, setResumo] = useState<any>(null);
  const [showPagar, setShowPagar] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState<Pagamento | null>(null);
  const { toast } = useToast();

  const carregar = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (filtroStatus) params.set('status', filtroStatus);
      if (filtroMes) params.set('mesReferencia', filtroMes);
      const [pgRes, resRes] = await Promise.all([
        api.get(`/pagamentos?${params}`),
        api.get(`/pagamentos/resumo?mes=${filtroMes}`),
      ]);
      setPagamentos(pgRes.data.data);
      setTotal(pgRes.data.total);
      setTotalPages(pgRes.data.totalPages);
      setResumo(resRes.data.data);
    } catch {
      toast('Erro ao carregar financeiro', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { carregar(); }, [page, filtroStatus, filtroMes]);

  const abrirPagar = (p: Pagamento) => { setSelectedPagamento(p); setShowPagar(true); };

  return (
    <div>
      <Header title="Financeiro" subtitle={`Gestão de pagamentos e inadimplência`} />

      <div className="mt-6 space-y-5">
        {/* KPIs do mês */}
        {resumo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard icon={DollarSign} label="Receita Prevista" value={formatCurrency(resumo.receitaPrevista)} sub={filtroMes} color="bg-primary-500" />
            <KPICard icon={CheckCircle} label="Receita Realizada" value={formatCurrency(resumo.receitaRealizada)} sub={`${resumo.receitaPrevista > 0 ? Math.round((resumo.receitaRealizada / resumo.receitaPrevista) * 100) : 0}% do previsto`} color="bg-green-600" />
            <KPICard icon={AlertCircle} label="Em Atraso" value={String(resumo.totalAtrasados)} sub={formatCurrency(resumo.valorAtrasado)} color="bg-red-600" />
            <KPICard icon={Clock} label="A Vencer" value={formatCurrency(resumo.receitaPrevista - resumo.receitaRealizada - resumo.valorAtrasado)} sub="Pendentes no mês" color="bg-yellow-500" />
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <input type="month" value={filtroMes} onChange={(e) => { setFiltroMes(e.target.value); setPage(1); }} className="input max-w-[160px]" />
          <select value={filtroStatus} onChange={(e) => { setFiltroStatus(e.target.value); setPage(1); }} className="input max-w-[160px]">
            <option value="">Todos os status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="ATRASADO">Atrasado</option>
            <option value="ISENTO">Isento</option>
          </select>
        </div>

        {/* Tabela de pagamentos */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Estudante</th>
                <th>Turma</th>
                <th>Mês Ref.</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Pagamento</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8}><LoadingSpinner /></td></tr>
              ) : pagamentos.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">Nenhum pagamento encontrado</td></tr>
              ) : (
                pagamentos.map((p) => (
                  <tr key={p.id} className={p.status === 'ATRASADO' ? 'bg-red-50' : ''}>
                    <td className="font-medium text-gray-900">{p.matricula?.estudante?.nomeCompleto}</td>
                    <td className="text-gray-500 text-xs">{p.matricula?.turma?.nome}</td>
                    <td>{formatMesReferencia(p.mesReferencia)}</td>
                    <td className={p.status === 'ATRASADO' ? 'text-red-600 font-medium' : ''}>{formatDate(p.dataVencimento)}</td>
                    <td className="font-medium">{formatCurrency(p.valorCobrado)}</td>
                    <td>{p.dataPagamento ? formatDate(p.dataPagamento) : '---'}</td>
                    <td><span className={getStatusPagamentoColor(p.status)}>{p.status}</span></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {(p.status === 'PENDENTE' || p.status === 'ATRASADO') && (
                          <button onClick={() => abrirPagar(p)} className="btn-primary btn-sm">Registrar</button>
                        )}
                        {p.status === 'PAGO' && (
                          <button onClick={() => window.open(`/api/relatorios/recibo-pagamento/${p.id}`, '_blank')} className="btn-ghost btn-sm p-1.5">
                            <FileText size={14} />
                          </button>
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

      {showPagar && selectedPagamento && (
        <PagarModal
          pagamento={selectedPagamento}
          onClose={() => { setShowPagar(false); carregar(); }}
        />
      )}
    </div>
  );
}
