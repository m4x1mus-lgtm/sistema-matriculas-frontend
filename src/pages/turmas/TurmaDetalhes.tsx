import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import Modal from '../../components/shared/Modal';
import api from '../../services/api';
import { Turma } from '../../types';
import { modalidadeLabel, turnoLabel, diasSemanaLabel, formatCurrency, formatDate } from '../../utils';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

interface Props {
  turmaId: string;
  onClose: () => void;
}

export default function TurmaDetalhes({ turmaId, onClose }: Props) {
  const [turma, setTurma] = useState<Turma | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/turmas/${turmaId}`).then(({ data }) => setTurma(data.data)).finally(() => setIsLoading(false));
  }, [turmaId]);

  return (
    <Modal isOpen onClose={onClose} title="Alunos da Turma" size="lg">
      {isLoading || !turma ? <LoadingSpinner /> : (
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{turma.nome}</h3>
                <div className="text-sm text-gray-500 mt-1">
                  {modalidadeLabel[turma.modalidade]} • {turnoLabel[turma.turno]} • {turma.horarioInicio}–{turma.horarioFim}
                </div>
                <div className="text-sm text-gray-500">
                  {turma.diasSemana.map((d) => diasSemanaLabel[d]).join(', ')} • {formatCurrency(turma.valorMensalidade)}/mês
                </div>
              </div>
              <button
                onClick={() => window.open(`/api/relatorios/chamada/${turmaId}`, '_blank')}
                className="btn-secondary btn-sm"
              >
                <FileText size={14} />Chamada PDF
              </button>
            </div>
            <div className="mt-2 text-sm">
              <span className={`font-medium ${(turma.alunosAtivos || 0) >= turma.capacidadeMaxima ? 'text-red-600' : 'text-green-700'}`}>
                {turma.alunosAtivos || 0} / {turma.capacidadeMaxima} alunos
              </span>
              <span className="text-gray-400 ml-1">• {turma.vagasDisponiveis} vagas disponíveis</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Lista de Alunos Ativos</h4>
            {!turma.matriculas || turma.matriculas.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nenhum aluno matriculado</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {turma.matriculas.map((m, i) => (
                  <div key={m.id} className="flex items-center py-2.5 gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{m.estudante?.nomeCompleto}</div>
                      <div className="text-xs text-gray-500">{m.estudante?.telefone || '---'} • {m.estudante?.email || '---'}</div>
                    </div>
                    <div className="text-xs text-gray-400">{m.numeroMatricula}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-400">
            Período: {formatDate(turma.dataInicio)} — {turma.dataFim ? formatDate(turma.dataFim) : 'Em aberto'}
          </div>
        </div>
      )}
    </Modal>
  );
}
