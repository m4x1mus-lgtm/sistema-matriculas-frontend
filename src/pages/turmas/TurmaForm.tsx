import { useEffect, useState } from 'react';
import Modal from '../../components/shared/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Usuario } from '../../types';

interface Props {
  turmaId: string | null;
  onClose: () => void;
}

const modalidades = ['SSA1', 'SSA2', 'ESCOLA_APLICACAO', 'ENEM', 'REFORCO_ESCOLAR'];
const turnos = ['MANHA', 'TARDE', 'NOITE'];
const diasSemana = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
const diasLabel: Record<string, string> = { SEG: 'Seg', TER: 'Ter', QUA: 'Qua', QUI: 'Qui', SEX: 'Sex', SAB: 'Sáb', DOM: 'Dom' };
const modalidadeLabel: Record<string, string> = { SSA1: 'SSA 1', SSA2: 'SSA 2', ESCOLA_APLICACAO: 'Escola de Aplicação', ENEM: 'ENEM', REFORCO_ESCOLAR: 'Reforço Escolar' };

export default function TurmaForm({ turmaId, onClose }: Props) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [form, setForm] = useState({
    nome: '', modalidade: 'SSA1', turno: 'MANHA', diasSemana: [] as string[],
    horarioInicio: '07:30', horarioFim: '12:00', capacidadeMaxima: 30,
    professorResponsavelId: '', valorMensalidade: 0,
    dataInicio: '', dataFim: '', status: 'ATIVA',
  });

  useEffect(() => {
    api.get('/usuarios').then(({ data }) => {
      setProfessores(data.data.filter((u: Usuario) => u.role === 'PROFESSOR' && u.ativo));
    }).catch(() => {});

    if (turmaId) {
      api.get(`/turmas/${turmaId}`).then(({ data }) => {
        const t = data.data;
        setForm({
          nome: t.nome, modalidade: t.modalidade, turno: t.turno,
          diasSemana: t.diasSemana, horarioInicio: t.horarioInicio, horarioFim: t.horarioFim,
          capacidadeMaxima: t.capacidadeMaxima, professorResponsavelId: t.professorResponsavelId || '',
          valorMensalidade: Number(t.valorMensalidade),
          dataInicio: t.dataInicio?.split('T')[0] || '',
          dataFim: t.dataFim?.split('T')[0] || '',
          status: t.status,
        });
      });
    }
  }, [turmaId]);

  const toggleDia = (dia: string) => {
    setForm((prev) => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter((d) => d !== dia)
        : [...prev.diasSemana, dia],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        capacidadeMaxima: Number(form.capacidadeMaxima),
        valorMensalidade: Number(form.valorMensalidade),
        professorResponsavelId: form.professorResponsavelId || null,
        dataFim: form.dataFim || null,
      };
      if (turmaId) {
        await api.put(`/turmas/${turmaId}`, payload);
        toast('Turma atualizada com sucesso!');
      } else {
        await api.post('/turmas', payload);
        toast('Turma criada com sucesso!');
      }
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Erro ao salvar turma', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={turmaId ? 'Editar Turma' : 'Nova Turma'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nome da Turma <span className="text-red-500">*</span></label>
          <input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="input" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Modalidade <span className="text-red-500">*</span></label>
            <select value={form.modalidade} onChange={(e) => setForm((p) => ({ ...p, modalidade: e.target.value }))} className="input">
              {modalidades.map((m) => <option key={m} value={m}>{modalidadeLabel[m]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Turno <span className="text-red-500">*</span></label>
            <select value={form.turno} onChange={(e) => setForm((p) => ({ ...p, turno: e.target.value }))} className="input">
              {turnos.map((t) => <option key={t} value={t}>{t === 'MANHA' ? 'Manhã' : t === 'TARDE' ? 'Tarde' : 'Noite'}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Horário Início</label>
            <input type="time" value={form.horarioInicio} onChange={(e) => setForm((p) => ({ ...p, horarioInicio: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Horário Fim</label>
            <input type="time" value={form.horarioFim} onChange={(e) => setForm((p) => ({ ...p, horarioFim: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Capacidade Máxima</label>
            <input type="number" min={1} value={form.capacidadeMaxima} onChange={(e) => setForm((p) => ({ ...p, capacidadeMaxima: Number(e.target.value) }))} className="input" />
          </div>
          <div>
            <label className="label">Mensalidade (R$)</label>
            <input type="number" step="0.01" min={0} value={form.valorMensalidade} onChange={(e) => setForm((p) => ({ ...p, valorMensalidade: Number(e.target.value) }))} className="input" />
          </div>
          <div>
            <label className="label">Data de Início</label>
            <input type="date" value={form.dataInicio} onChange={(e) => setForm((p) => ({ ...p, dataInicio: e.target.value }))} className="input" required />
          </div>
          <div>
            <label className="label">Data de Fim</label>
            <input type="date" value={form.dataFim} onChange={(e) => setForm((p) => ({ ...p, dataFim: e.target.value }))} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Dias da Semana</label>
          <div className="flex gap-2 flex-wrap">
            {diasSemana.map((dia) => (
              <button type="button" key={dia}
                onClick={() => toggleDia(dia)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.diasSemana.includes(dia) ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'}`}
              >
                {diasLabel[dia]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Professor Responsável</label>
          <select value={form.professorResponsavelId} onChange={(e) => setForm((p) => ({ ...p, professorResponsavelId: e.target.value }))} className="input">
            <option value="">Selecionar professor...</option>
            {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Salvando...' : turmaId ? 'Salvar Alterações' : 'Criar Turma'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
