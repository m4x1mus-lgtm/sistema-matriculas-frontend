// Wizard de matrícula em 5 etapas
import { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import Modal from '../../components/shared/Modal';
import api from '../../services/api';
import { Estudante, Turma } from '../../types';
import { formatCurrency, modalidadeLabel, turnoLabel } from '../../utils';
import { useToast } from '../../context/ToastContext';

interface Props {
  onClose: () => void;
}

const etapas = ['Estudante', 'Turma', 'Financeiro', 'Revisão', 'Confirmação'];

const formaPagamentoLabel: Record<string, string> = {
  PIX: 'PIX', BOLETO: 'Boleto', CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito', DINHEIRO: 'Dinheiro',
};

export default function NovaMatricula({ onClose }: Props) {
  const [etapa, setEtapa] = useState(0);
  const [busca, setBusca] = useState('');
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [estudante, setEstudante] = useState<Estudante | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turma, setTurma] = useState<Turma | null>(null);
  const [form, setForm] = useState({
    formaPagamento: 'PIX', diaVencimento: 10,
    descontoPercentual: 0, motivoDesconto: '', observacoes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [matriculaCriada, setMatriculaCriada] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    api.get('/turmas?status=ATIVA&pageSize=100').then(({ data }) => setTurmas(data.data));
  }, []);

  const buscarEstudante = async () => {
    if (!busca) return;
    const { data } = await api.get(`/estudantes?busca=${busca}&pageSize=5`);
    setEstudantes(data.data);
  };

  const valorFinal = turma ? Number(turma.valorMensalidade) * (1 - form.descontoPercentual / 100) : 0;

  const confirmar = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/matriculas', {
        estudanteId: estudante!.id,
        turmaId: turma!.id,
        formaPagamento: form.formaPagamento,
        diaVencimento: form.diaVencimento,
        descontoPercentual: form.descontoPercentual,
        motivoDesconto: form.motivoDesconto || null,
        observacoes: form.observacoes || null,
      });
      setMatriculaCriada(data.data);
      setEtapa(4);
    } catch (err: any) {
      toast(err.response?.data?.message || 'Erro ao realizar matrícula', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Nova Matrícula" size="lg">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-6">
        {etapas.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < etapa ? 'bg-green-500 text-white' : i === etapa ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i < etapa ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={`text-xs ml-1 hidden sm:inline ${i === etapa ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{label}</span>
            {i < etapas.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < etapa ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Etapa 0: Buscar estudante */}
      {etapa === 0 && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarEstudante()}
              placeholder="Buscar estudante por nome ou CPF..."
              className="input flex-1"
            />
            <button onClick={buscarEstudante} className="btn-primary">Buscar</button>
          </div>
          {estudantes.length > 0 && (
            <div className="border border-gray-200 rounded-xl divide-y">
              {estudantes.map((e) => (
                <button key={e.id} onClick={() => { setEstudante(e); setEtapa(1); }}
                  className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors">
                  <div className="font-medium text-gray-900">{e.nomeCompleto}</div>
                  <div className="text-sm text-gray-500">{e.telefone} {e.cpf && `• CPF: ${e.cpf}`}</div>
                </button>
              ))}
            </div>
          )}
          {estudantes.length === 0 && busca && (
            <p className="text-sm text-gray-400 text-center py-4">Nenhum estudante encontrado.</p>
          )}
        </div>
      )}

      {/* Etapa 1: Selecionar turma */}
      {etapa === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Estudante: <strong>{estudante?.nomeCompleto}</strong></p>
          <p className="text-sm font-medium text-gray-700">Selecione a turma:</p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {turmas.map((t) => {
              const alunosAtivos = (t as any).alunosAtivos || 0;
              const lotado = alunosAtivos >= t.capacidadeMaxima;
              return (
                <button key={t.id} disabled={lotado}
                  onClick={() => { setTurma(t); setEtapa(2); }}
                  className={`w-full text-left p-3 border rounded-xl transition-colors ${lotado ? 'opacity-50 cursor-not-allowed border-gray-200' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{t.nome}</div>
                      <div className="text-sm text-gray-500">{modalidadeLabel[t.modalidade]} • {turnoLabel[t.turno]} • {t.horarioInicio}–{t.horarioFim}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary-600">{formatCurrency(t.valorMensalidade)}/mês</div>
                      <div className={`text-xs ${lotado ? 'text-red-500' : 'text-gray-500'}`}>
                        {lotado ? 'Lotado' : `${t.capacidadeMaxima - alunosAtivos} vagas`}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={() => setEtapa(0)} className="text-sm text-gray-500 hover:text-gray-700">← Voltar</button>
        </div>
      )}

      {/* Etapa 2: Condições financeiras */}
      {etapa === 2 && turma && (
        <div className="space-y-4">
          <div className="p-3 bg-primary-50 rounded-xl text-sm">
            <span className="text-gray-600">Turma: </span><strong>{turma.nome}</strong>
            <span className="ml-3 text-gray-600">Mensalidade base: </span><strong>{formatCurrency(turma.valorMensalidade)}</strong>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Forma de Pagamento</label>
              <select value={form.formaPagamento} onChange={(e) => setForm((p) => ({ ...p, formaPagamento: e.target.value }))} className="input">
                {Object.entries(formaPagamentoLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Dia de Vencimento</label>
              <select value={form.diaVencimento} onChange={(e) => setForm((p) => ({ ...p, diaVencimento: Number(e.target.value) }))} className="input">
                {[5, 10, 15, 20, 25, 28].map((d) => <option key={d} value={d}>Dia {d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Desconto (%)</label>
              <input type="number" min={0} max={100} value={form.descontoPercentual}
                onChange={(e) => setForm((p) => ({ ...p, descontoPercentual: Number(e.target.value) }))} className="input" />
            </div>
            <div>
              <label className="label">Mensalidade Final</label>
              <div className="input bg-gray-50 font-bold text-primary-600">{formatCurrency(valorFinal)}</div>
            </div>
          </div>
          {form.descontoPercentual > 0 && (
            <div>
              <label className="label">Motivo do Desconto <span className="text-red-500">*</span></label>
              <input value={form.motivoDesconto}
                onChange={(e) => setForm((p) => ({ ...p, motivoDesconto: e.target.value }))}
                className="input" placeholder="Ex: Bolsa social, irmão matriculado..." />
            </div>
          )}
          <div>
            <label className="label">Observações</label>
            <textarea value={form.observacoes}
              onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
              className="input h-16 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setEtapa(1)} className="btn-secondary flex-1">← Voltar</button>
            <button onClick={() => setEtapa(3)} className="btn-primary flex-1">
              Revisar <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Etapa 3: Revisão */}
      {etapa === 3 && estudante && turma && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Revise os dados antes de confirmar:</h3>
          <div className="space-y-2">
            {[
              { label: 'Estudante', value: estudante.nomeCompleto },
              { label: 'Turma', value: turma.nome },
              { label: 'Modalidade', value: modalidadeLabel[turma.modalidade] },
              { label: 'Horário', value: `${turnoLabel[turma.turno]} • ${turma.horarioInicio}–${turma.horarioFim}` },
              { label: 'Forma de Pagamento', value: formaPagamentoLabel[form.formaPagamento] },
              { label: 'Dia de Vencimento', value: `Todo dia ${form.diaVencimento}` },
              { label: 'Desconto', value: form.descontoPercentual > 0 ? `${form.descontoPercentual}% — ${form.motivoDesconto}` : 'Sem desconto' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Mensalidade Final</span>
              <span className="text-xl font-bold text-primary-600">{formatCurrency(valorFinal)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setEtapa(2)} className="btn-secondary flex-1">← Voltar</button>
            <button onClick={confirmar} disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? 'Confirmando...' : 'Confirmar Matrícula'}
            </button>
          </div>
        </div>
      )}

      {/* Etapa 4: Sucesso */}
      {etapa === 4 && matriculaCriada && (
        <div className="text-center space-y-4 py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-green-600" size={36} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Matrícula Confirmada!</h3>
            <p className="text-sm text-gray-500 mt-1">Número de matrícula:</p>
            <p className="text-2xl font-mono font-bold text-primary-600 mt-1">{matriculaCriada.numeroMatricula}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.open(`/api/relatorios/contrato/${matriculaCriada.id}`, '_blank')}
              className="btn-secondary w-full"
            >
              <FileText size={16} />Baixar Contrato PDF
            </button>
            <button
              onClick={() => window.open(`/api/relatorios/recibo-matricula/${matriculaCriada.id}`, '_blank')}
              className="btn-secondary w-full"
            >
              <FileText size={16} />Baixar Recibo PDF
            </button>
            <button onClick={onClose} className="btn-primary w-full">Concluir</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
