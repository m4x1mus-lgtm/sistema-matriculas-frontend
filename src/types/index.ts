// Tipos TypeScript espelhando os modelos do backend

export type Role = 'ADMIN' | 'SECRETARIA' | 'PROFESSOR';
export type Modalidade = 'SSA1' | 'SSA2' | 'ESCOLA_APLICACAO' | 'ENEM' | 'REFORCO_ESCOLAR';
export type Turno = 'MANHA' | 'TARDE' | 'NOITE';
export type DiaSemana = 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB' | 'DOM';
export type StatusTurma = 'ATIVA' | 'ENCERRADA' | 'AGUARDANDO';
export type StatusMatricula = 'ATIVA' | 'TRANCADA' | 'CANCELADA' | 'CONCLUIDA';
export type FormaPagamento = 'PIX' | 'BOLETO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO';
export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'ISENTO' | 'CANCELADO';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
}

export interface Estudante {
  id: string;
  nomeCompleto: string;
  dataNascimento: string;
  cpf?: string;
  rg?: string;
  email?: string;
  telefone?: string;
  telefoneResponsavel?: string;
  nomeResponsavel?: string;
  cpfResponsavel?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  escolaOrigem?: string;
  serieAtual?: string;
  foto?: string;
  observacoes?: string;
  createdAt: string;
  matriculas?: Matricula[];
}

export interface Turma {
  id: string;
  nome: string;
  modalidade: Modalidade;
  turno: Turno;
  diasSemana: DiaSemana[];
  horarioInicio: string;
  horarioFim: string;
  capacidadeMaxima: number;
  professorResponsavelId?: string;
  professorResponsavel?: { id: string; nome: string };
  valorMensalidade: number;
  dataInicio: string;
  dataFim?: string;
  status: StatusTurma;
  alunosAtivos?: number;
  vagasDisponiveis?: number;
  matriculas?: Matricula[];
}

export interface Matricula {
  id: string;
  estudanteId: string;
  turmaId: string;
  estudante?: Estudante;
  turma?: Turma;
  dataMatricula: string;
  numeroMatricula: string;
  status: StatusMatricula;
  formaPagamento: FormaPagamento;
  diaVencimento: number;
  descontoPercentual: number;
  motivoDesconto?: string;
  valorFinalMensalidade: number;
  observacoes?: string;
  responsavelMatricula?: string;
  pagamentos?: Pagamento[];
  historico?: HistoricoMatricula[];
  createdAt: string;
}

export interface Pagamento {
  id: string;
  matriculaId: string;
  matricula?: Matricula;
  mesReferencia: string;
  valorCobrado: number;
  valorPago?: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: StatusPagamento;
  formaPagamento?: FormaPagamento;
  comprovanteUrl?: string;
  observacoes?: string;
}

export interface HistoricoMatricula {
  id: string;
  matriculaId: string;
  statusAntes: StatusMatricula;
  statusDepois: StatusMatricula;
  motivo: string;
  usuario: string;
  createdAt: string;
}

export interface DashboardKPIs {
  totalAlunos: number;
  novasMatriculasMes: number;
  matriculasPorModalidade: Record<string, number>;
  receitaPrevista: number;
  receitaRealizada: number;
  pagamentosAtrasados: { quantidade: number; valor: number };
  vagasPorTurma: Array<{
    id: string;
    nome: string;
    modalidade: Modalidade;
    capacidadeMaxima: number;
    alunosAtivos: number;
    vagasDisponiveis: number;
    percentualOcupacao: number;
  }>;
  mesReferencia: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  success: boolean;
}
