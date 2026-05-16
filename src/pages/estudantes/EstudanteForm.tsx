import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import Modal from '../../components/shared/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Turma } from '../../types';
import { formatCurrency, modalidadeLabel, turnoLabel } from '../../utils';

function validarCPF(cpf: string): boolean {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11 || /^(\d)\1+$/.test(nums)) return false;
  const calc = (n: number) => {
    const sum = nums.slice(0, n).split('').reduce((acc, d, i) => acc + Number(d) * (n + 1 - i), 0);
    const rest = (sum * 10) % 11;
    return rest >= 10 ? 0 : rest;
  };
  return calc(9) === Number(nums[9]) && calc(10) === Number(nums[10]);
}

interface Props {
  estudanteId: string | null;
  onClose: () => void;
}

const initialForm = {
  nomeCompleto: '', dataNascimento: '', cpf: '', rg: '', email: '', telefone: '',
  nomeResponsavel: '', cpfResponsavel: '', rgResponsavel: '', emailResponsavel: '', telefoneResponsavel: '',
  logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
  escolaOrigem: '', serieAtual: '', observacoes: '',
};

const formaPagamentoLabel: Record<string, string> = {
  PIX: 'PIX', BOLETO: 'Boleto', CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito', DINHEIRO: 'Dinheiro',
};

export default function EstudanteForm({ estudanteId, onClose }: Props) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);
  const [cpfResponsavelValido, setCpfResponsavelValido] = useState<boolean | null>(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Matrícula opcional (só no cadastro)
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaId, setTurmaId] = useState('');
  const [matriculaForm, setMatriculaForm] = useState({
    formaPagamento: 'PIX', diaVencimento: 10, descontoPercentual: 0, motivoDesconto: '',
  });

  const turmaSelecionada = turmas.find((t) => t.id === turmaId) ?? null;
  const valorFinal = turmaSelecionada
    ? Number(turmaSelecionada.valorMensalidade) * (1 - matriculaForm.descontoPercentual / 100)
    : 0;

  useEffect(() => {
    if (!estudanteId) {
      api.get('/turmas?status=ATIVA&pageSize=100').then(({ data }) => setTurmas(data.data));
    }
  }, [estudanteId]);

  useEffect(() => {
    if (estudanteId) {
      api.get(`/estudantes/${estudanteId}`).then(({ data }) => {
        const e = data.data;
        setForm({
          nomeCompleto: e.nomeCompleto || '',
          dataNascimento: e.dataNascimento ? e.dataNascimento.split('T')[0] : '',
          cpf: e.cpf || '', rg: e.rg || '', email: e.email || '', telefone: e.telefone || '',
          nomeResponsavel: e.nomeResponsavel || '', cpfResponsavel: e.cpfResponsavel || '',
          rgResponsavel: e.rgResponsavel || '', emailResponsavel: e.emailResponsavel || '',
          telefoneResponsavel: e.telefoneResponsavel || '', logradouro: e.logradouro || '',
          numero: e.numero || '', complemento: e.complemento || '', bairro: e.bairro || '',
          cidade: e.cidade || '', estado: e.estado || '', cep: e.cep || '',
          escolaOrigem: e.escolaOrigem || '', serieAtual: e.serieAtual || '',
          observacoes: e.observacoes || '',
        });
      });
    }
  }, [estudanteId]);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleCPFBlur = (cpf: string) => {
    const limpo = cpf.replace(/\D/g, '');
    if (!limpo) { setCpfValido(null); return; }
    const valido = validarCPF(limpo);
    setCpfValido(valido);
    if (!valido) {
      setErrors((prev) => ({ ...prev, cpf: 'CPF inválido' }));
    } else {
      setErrors((prev) => { const n = { ...prev }; delete n['cpf']; return n; });
    }
  };

  const handleCPFResponsavelBlur = (cpf: string) => {
    const limpo = cpf.replace(/\D/g, '');
    if (!limpo) { setCpfResponsavelValido(null); return; }
    const valido = validarCPF(limpo);
    setCpfResponsavelValido(valido);
    if (!valido) {
      setErrors((prev) => ({ ...prev, cpfResponsavel: 'CPF inválido' }));
    } else {
      setErrors((prev) => { const n = { ...prev }; delete n['cpfResponsavel']; return n; });
    }
  };

  const handleCepBlur = async (cep: string) => {
    const limpo = cep.replace(/\D/g, '');
    if (limpo.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado' }));
        return;
      }
      setForm((prev) => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }));
      setErrors((prev) => { const n = { ...prev }; delete n['cep']; return n; });
    } catch {
      setErrors((prev) => ({ ...prev, cep: 'Erro ao buscar CEP' }));
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (turmaId && matriculaForm.descontoPercentual > 0 && !matriculaForm.motivoDesconto.trim()) {
      setErrors((prev) => ({ ...prev, motivoDesconto: 'Informe o motivo do desconto' }));
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...form,
        cpf: form.cpf || null,
        nomeResponsavel: form.nomeResponsavel || null,
        cpfResponsavel: form.cpfResponsavel || null,
        rgResponsavel: form.rgResponsavel || null,
        emailResponsavel: form.emailResponsavel || null,
        telefoneResponsavel: form.telefoneResponsavel || null,
      };

      if (estudanteId) {
        await api.put(`/estudantes/${estudanteId}`, payload);
        toast('Estudante atualizado com sucesso!');
      } else {
        const { data } = await api.post('/estudantes', payload);
        const novoEstudanteId = data.data.id;

        if (turmaId) {
          await api.post('/matriculas', {
            estudanteId: novoEstudanteId,
            turmaId,
            formaPagamento: matriculaForm.formaPagamento,
            diaVencimento: matriculaForm.diaVencimento,
            descontoPercentual: matriculaForm.descontoPercentual,
            motivoDesconto: matriculaForm.motivoDesconto || null,
          });
          toast('Estudante cadastrado e matrícula realizada com sucesso!');
        } else {
          toast('Estudante cadastrado com sucesso!');
        }
      }
      onClose();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errs: Record<string, string> = {};
        err.response.data.errors.forEach((e: any) => { errs[e.field] = e.message; });
        setErrors(errs);
      } else {
        toast(err.response?.data?.message || 'Erro ao salvar', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sectionClass = 'text-sm font-semibold text-primary-700 mb-3 border-b border-primary-100 pb-2';

  return (
    <Modal isOpen onClose={onClose} title={estudanteId ? 'Editar Estudante' : 'Novo Estudante'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Dados pessoais */}
        <div className="space-y-3">
          <h3 className={sectionClass}>Dados Pessoais</h3>

          <div>
            <label className="label">Nome Completo <span className="text-red-500">*</span></label>
            <input type="text" value={form.nomeCompleto} onChange={set('nomeCompleto')} className="input" required />
            {errors.nomeCompleto && <p className="text-xs text-red-500 mt-1">{errors.nomeCompleto}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Data de Nascimento <span className="text-red-500">*</span></label>
              <input type="date" value={form.dataNascimento} onChange={set('dataNascimento')} className="input" required />
            </div>
            <div>
              <label className="label">CPF</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => { set('cpf')(e); setCpfValido(null); }}
                  onBlur={(e) => handleCPFBlur(e.target.value)}
                  className={`input pr-8 ${cpfValido === true ? 'border-green-500 focus:ring-green-500' : cpfValido === false ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="000.000.000-00"
                />
                {cpfValido === true && <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
                {cpfValido === false && <XCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />}
              </div>
              {cpfValido === true && <p className="text-xs text-green-600 mt-1">CPF válido</p>}
              {cpfValido === false && <p className="text-xs text-red-500 mt-1">CPF inválido</p>}
            </div>
            <div>
              <label className="label">RG</label>
              <input type="text" value={form.rg} onChange={set('rg')} className="input" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Telefone</label>
              <input type="text" value={form.telefone} onChange={set('telefone')} className="input" placeholder="(71) 99999-0000" />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input type="email" value={form.email} onChange={set('email')} className="input" />
            </div>
            <div>
              <label className="label">Escola de Origem</label>
              <input type="text" value={form.escolaOrigem} onChange={set('escolaOrigem')} className="input" />
            </div>
          </div>

          <div className="w-1/3 pr-1.5">
            <label className="label">Série Atual</label>
            <input type="text" value={form.serieAtual} onChange={set('serieAtual')} className="input" />
          </div>
        </div>

        {/* Responsável */}
        <div className="space-y-3">
          <h3 className={sectionClass}>Responsável (obrigatório para menores de 18 anos)</h3>

          <div>
            <label className="label">Nome do Responsável</label>
            <input type="text" value={form.nomeResponsavel} onChange={set('nomeResponsavel')} className="input" />
            {errors.nomeResponsavel && <p className="text-xs text-red-500 mt-1">{errors.nomeResponsavel}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">CPF do Responsável</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.cpfResponsavel}
                  onChange={(e) => { set('cpfResponsavel')(e); setCpfResponsavelValido(null); }}
                  onBlur={(e) => handleCPFResponsavelBlur(e.target.value)}
                  className={`input pr-8 ${cpfResponsavelValido === true ? 'border-green-500' : cpfResponsavelValido === false ? 'border-red-500' : ''}`}
                  placeholder="000.000.000-00"
                />
                {cpfResponsavelValido === true && <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
                {cpfResponsavelValido === false && <XCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />}
              </div>
              {cpfResponsavelValido === true && <p className="text-xs text-green-600 mt-1">CPF válido</p>}
              {cpfResponsavelValido === false && <p className="text-xs text-red-500 mt-1">CPF inválido</p>}
              {errors.cpfResponsavel && !cpfResponsavelValido && <p className="text-xs text-red-500 mt-1">{errors.cpfResponsavel}</p>}
            </div>
            <div>
              <label className="label">RG do Responsável</label>
              <input type="text" value={form.rgResponsavel} onChange={set('rgResponsavel')} className="input" />
            </div>
            <div>
              <label className="label">Telefone do Responsável</label>
              <input type="text" value={form.telefoneResponsavel} onChange={set('telefoneResponsavel')} className="input" placeholder="(71) 99999-0000" />
            </div>
          </div>

          <div>
            <label className="label">E-mail do Responsável</label>
            <input type="email" value={form.emailResponsavel} onChange={set('emailResponsavel')} className="input" />
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-3">
          <h3 className={sectionClass}>Endereço</h3>
          <div>
            <label className="label">Logradouro</label>
            <input type="text" value={form.logradouro} onChange={set('logradouro')} className="input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Número</label>
              <input type="text" value={form.numero} onChange={set('numero')} className="input" />
            </div>
            <div>
              <label className="label">Complemento</label>
              <input type="text" value={form.complemento} onChange={set('complemento')} className="input" />
            </div>
            <div>
              <label className="label">Bairro</label>
              <input type="text" value={form.bairro} onChange={set('bairro')} className="input" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Cidade</label>
              <input type="text" value={form.cidade} onChange={set('cidade')} className="input" />
            </div>
            <div>
              <label className="label">Estado (UF)</label>
              <input type="text" value={form.estado} onChange={set('estado')} className="input" maxLength={2} />
            </div>
            <div>
              <label className="label">CEP</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.cep}
                  onChange={set('cep')}
                  onBlur={(e) => handleCepBlur(e.target.value)}
                  className="input pr-8"
                  placeholder="00000-000"
                  maxLength={9}
                />
                {buscandoCep && (
                  <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin" />
                )}
              </div>
              {errors.cep && <p className="text-xs text-red-500 mt-1">{errors.cep}</p>}
            </div>
          </div>
        </div>


        {/* Observações */}
        <div>
          <label className="label">Observações</label>
          <textarea value={form.observacoes} onChange={set('observacoes')} className="input h-20 resize-none" />
        </div>

        {/* Matrícula (só no cadastro novo) */}
        {!estudanteId && (
          <div className="border border-primary-200 rounded-xl p-4 bg-primary-50">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-700 mb-3">
              <BookOpen size={16} />
              Matrícula em Turma <span className="font-normal text-primary-500">(opcional)</span>
            </h3>

            <div>
              <label className="label">Selecionar Turma</label>
              <select
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
                className="input"
              >
                <option value="">— Cadastrar sem matrícula —</option>
                {turmas.map((t) => {
                  const ativos = (t as any).alunosAtivos ?? 0;
                  const lotado = ativos >= t.capacidadeMaxima;
                  return (
                    <option key={t.id} value={t.id} disabled={lotado}>
                      {t.nome} — {modalidadeLabel[t.modalidade]} / {turnoLabel[t.turno]} — {formatCurrency(t.valorMensalidade)}/mês
                      {lotado ? ' (Lotada)' : ` (${t.capacidadeMaxima - ativos} vagas)`}
                    </option>
                  );
                })}
              </select>
            </div>

            {turmaSelecionada && (
              <div className="mt-4 space-y-3">
                {/* Resumo da turma */}
                <div className="flex gap-4 p-3 bg-white rounded-lg border border-primary-100 text-sm">
                  <div>
                    <span className="text-gray-500">Horário:</span>{' '}
                    <strong>{turmaSelecionada.horarioInicio}–{turmaSelecionada.horarioFim}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Turno:</span>{' '}
                    <strong>{turnoLabel[turmaSelecionada.turno]}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Mensalidade:</span>{' '}
                    <strong className="text-primary-600">{formatCurrency(turmaSelecionada.valorMensalidade)}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Forma de Pagamento</label>
                    <select
                      value={matriculaForm.formaPagamento}
                      onChange={(e) => setMatriculaForm((p) => ({ ...p, formaPagamento: e.target.value }))}
                      className="input"
                    >
                      {Object.entries(formaPagamentoLabel).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Dia de Vencimento</label>
                    <select
                      value={matriculaForm.diaVencimento}
                      onChange={(e) => setMatriculaForm((p) => ({ ...p, diaVencimento: Number(e.target.value) }))}
                      className="input"
                    >
                      {[5, 10, 15, 20, 25, 28].map((d) => <option key={d} value={d}>Dia {d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Desconto (%)</label>
                    <input
                      type="number" min={0} max={100}
                      value={matriculaForm.descontoPercentual}
                      onChange={(e) => setMatriculaForm((p) => ({ ...p, descontoPercentual: Number(e.target.value) }))}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Mensalidade Final</label>
                    <div className="input bg-white font-bold text-primary-600">{formatCurrency(valorFinal)}</div>
                  </div>
                </div>

                {matriculaForm.descontoPercentual > 0 && (
                  <div>
                    <label className="label">Motivo do Desconto <span className="text-red-500">*</span></label>
                    <input
                      value={matriculaForm.motivoDesconto}
                      onChange={(e) => {
                        setMatriculaForm((p) => ({ ...p, motivoDesconto: e.target.value }));
                        setErrors((prev) => { const n = { ...prev }; delete n['motivoDesconto']; return n; });
                      }}
                      className="input"
                      placeholder="Ex: Bolsa social, irmão matriculado..."
                    />
                    {errors.motivoDesconto && <p className="text-xs text-red-500 mt-1">{errors.motivoDesconto}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Salvando...' : estudanteId ? 'Salvar Alterações' : turmaId ? 'Cadastrar e Matricular' : 'Cadastrar Estudante'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
