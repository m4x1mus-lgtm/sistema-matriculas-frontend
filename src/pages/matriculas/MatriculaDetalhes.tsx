import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import Modal from '../../components/shared/Modal';
import api from '../../services/api';
import { Matricula } from '../../types';
import { formatDate, formatCurrency, getStatusMatriculaColor, getStatusPagamentoColor, formaPagamentoLabel, formatMesReferencia, modalidadeLabel } from '../../utils';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

interface Props { matriculaId: string; onClose: () => void; }

export default function MatriculaDetalhes({ matriculaId, onClose }: Props) {
  const [matricula, setMatricula] = useState<Matricula | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/matriculas/${matriculaId}`).then(({ data }) => setMatricula(data.data)).finally(() => setIsLoading(false));
  }, [matriculaId]);

  return (
    <Modal isOpen onClose={onClose} title="Detalhes da Matrícula" size="xl">
      {isLoading || !matricula ? <LoadingSpinner /> : (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
            <div>
              <div className="text-2xl font-mono font-bold text-primary-600">{matricula.numeroMatricula}</div>
              <div className="text-sm text-gray-600 mt-0.5">{matricula.estudante?.nomeCompleto}</div>
              <div className="text-sm text-gray-500">{matricula.turma?.nome} • {matricula.turma ? modalidadeLabel[matricula.turma.modalidade] : ''}</div>
            </div>
            <div className="text-right space-y-2">
              <span className={getStatusMatriculaColor(matricula.status)}>{matricula.status}</span>
              <div className="flex gap-2">
                <button onClick={() => window.open(`/api/relatorios/contrato/${matriculaId}`, '_blank')} className="btn-secondary btn-sm">
                  <FileText size={14} />Contrato
                </button>
                <button onClick={() => window.open(`/api/relatorios/recibo-matricula/${matriculaId}`, '_blank')} className="btn-secondary btn-sm">
                  <FileText size={14} />Recibo
                </button>
              </div>
            </div>
          </div>

          {/* Condições financeiras */}
          <div className="grid grid-cols-4 gap-3 text-sm">
            {[
              { label: 'Mensalidade', value: formatCurrency(matricula.valorFinalMensalidade) },
              { label: 'Desconto', value: `${Number(matricula.descontoPercentual)}%` },
              { label: 'Vencimento', value: `Dia ${matricula.diaVencimento}` },
              { label: 'Forma Pgto', value: formaPagamentoLabel[matricula.formaPagamento] },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-500 text-xs">{label}</div>
                <div className="font-semibold text-gray-900 mt-0.5">{value}</div>
              </div>
            ))}
          </div>

          {/* Pagamentos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Pagamentos</h3>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Mês</th><th>Vencimento</th><th>Valor</th><th>Pago em</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {matricula.pagamentos?.map((p) => (
                    <tr key={p.id}>
                      <td>{formatMesReferencia(p.mesReferencia)}</td>
                      <td>{formatDate(p.dataVencimento)}</td>
                      <td>{formatCurrency(p.valorCobrado)}</td>
                      <td>{p.dataPagamento ? formatDate(p.dataPagamento) : '---'}</td>
                      <td><span className={getStatusPagamentoColor(p.status)}>{p.status}</span></td>
                      <td>
                        {p.status === 'PAGO' && (
                          <button onClick={() => window.open(`/api/relatorios/recibo-pagamento/${p.id}`, '_blank')} className="btn-ghost btn-sm p-1">
                            <FileText size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico */}
          {matricula.historico && matricula.historico.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Histórico de Alterações</h3>
              <div className="space-y-2">
                {matricula.historico.map((h) => (
                  <div key={h.id} className="flex items-start gap-3 text-sm border-l-2 border-yellow-400 pl-3 py-1">
                    <div className="flex-1">
                      <span className={getStatusMatriculaColor(h.statusAntes)}>{h.statusAntes}</span>
                      <span className="text-gray-400 mx-2">→</span>
                      <span className={getStatusMatriculaColor(h.statusDepois)}>{h.statusDepois}</span>
                      <span className="text-gray-500 ml-2 text-xs">por {h.usuario}</span>
                    </div>
                    <div className="text-gray-500 text-xs">{formatDate(h.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
