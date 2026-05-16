import { useEffect, useState } from 'react';
import { FileText, Pencil } from 'lucide-react';
import Modal from '../../components/shared/Modal';
import api from '../../services/api';
import { Estudante } from '../../types';
import { formatDate, formatCurrency, getStatusMatriculaColor, getStatusPagamentoColor, formatMesReferencia } from '../../utils';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

interface Props {
  estudanteId: string;
  onClose: () => void;
  onEditar: () => void;
}

export default function EstudanteDetalhes({ estudanteId, onClose, onEditar }: Props) {
  const [estudante, setEstudante] = useState<Estudante | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/estudantes/${estudanteId}`)
      .then(({ data }) => setEstudante(data.data))
      .finally(() => setIsLoading(false));
  }, [estudanteId]);

  return (
    <Modal isOpen onClose={onClose} title="Detalhes do Estudante" size="xl">
      {isLoading || !estudante ? <LoadingSpinner /> : (
        <div className="space-y-5">
          {/* Header do estudante */}
          <div className="flex items-start gap-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {estudante.nomeCompleto.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{estudante.nomeCompleto}</h2>
              <div className="text-sm text-gray-500 mt-0.5">
                {estudante.email} • {estudante.telefone}
              </div>
              <div className="text-sm text-gray-500">
                Nascimento: {formatDate(estudante.dataNascimento)}
                {estudante.cpf && ` • CPF: ${estudante.cpf}`}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onEditar} className="btn-secondary btn-sm">
                <Pencil size={14} />Editar
              </button>
              <button
                onClick={() => window.open(`/api/relatorios/ficha/${estudanteId}`, '_blank')}
                className="btn-secondary btn-sm"
              >
                <FileText size={14} />Ficha PDF
              </button>
            </div>
          </div>

          {/* Dados do responsável */}
          {estudante.nomeResponsavel && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Responsável</h3>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><div className="text-gray-500 text-xs">Nome</div>{estudante.nomeResponsavel}</div>
                <div><div className="text-gray-500 text-xs">CPF</div>{estudante.cpfResponsavel || '---'}</div>
                <div><div className="text-gray-500 text-xs">Telefone</div>{estudante.telefoneResponsavel || '---'}</div>
              </div>
            </div>
          )}

          {/* Matrículas */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Histórico de Matrículas</h3>
            {estudante.matriculas?.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma matrícula registrada</p>
            ) : (
              <div className="space-y-3">
                {estudante.matriculas?.map((m) => (
                  <div key={m.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-mono text-sm text-primary-600 font-semibold">{m.numeroMatricula}</span>
                        <span className="ml-2 text-gray-600">{m.turma?.nome}</span>
                      </div>
                      <span className={getStatusMatriculaColor(m.status)}>{m.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div><span className="text-gray-500 text-xs">Mensalidade</span><div>{formatCurrency(m.valorFinalMensalidade)}</div></div>
                      <div><span className="text-gray-500 text-xs">Vencimento</span><div>Dia {m.diaVencimento}</div></div>
                      <div><span className="text-gray-500 text-xs">Data Matrícula</span><div>{formatDate(m.dataMatricula)}</div></div>
                    </div>
                    {/* Pagamentos recentes */}
                    {m.pagamentos && m.pagamentos.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Últimos pagamentos:</div>
                        <div className="flex flex-wrap gap-1">
                          {m.pagamentos.slice(-6).map((p) => (
                            <span key={p.id} className={`text-xs px-2 py-0.5 rounded ${getStatusPagamentoColor(p.status)}`}>
                              {formatMesReferencia(p.mesReferencia)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
