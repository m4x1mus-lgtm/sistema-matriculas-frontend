// Utilitários gerais

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '---';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '---';
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '---';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '---';
  }
}

export function formatMesReferencia(mesRef: string): string {
  if (!mesRef) return '---';
  const [ano, mes] = mesRef.split('-');
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${meses[parseInt(mes) - 1]}/${ano}`;
}

export const modalidadeLabel: Record<string, string> = {
  SSA1: 'SSA 1',
  SSA2: 'SSA 2',
  ESCOLA_APLICACAO: 'Escola de Aplicação',
  ENEM: 'ENEM',
  REFORCO_ESCOLAR: 'Reforço Escolar',
};

export const turnoLabel: Record<string, string> = {
  MANHA: 'Manhã',
  TARDE: 'Tarde',
  NOITE: 'Noite',
};

export const diasSemanaLabel: Record<string, string> = {
  SEG: 'Seg', TER: 'Ter', QUA: 'Qua', QUI: 'Qui', SEX: 'Sex', SAB: 'Sáb', DOM: 'Dom',
};

export const formaPagamentoLabel: Record<string, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  DINHEIRO: 'Dinheiro',
};

export function getStatusMatriculaColor(status: string) {
  const map: Record<string, string> = {
    ATIVA: 'badge-green',
    TRANCADA: 'badge-gray',
    CANCELADA: 'badge-red',
    CONCLUIDA: 'badge-blue',
  };
  return map[status] || 'badge-gray';
}

export function getStatusPagamentoColor(status: string) {
  const map: Record<string, string> = {
    PAGO: 'badge-green',
    PENDENTE: 'badge-yellow',
    ATRASADO: 'badge-red',
    ISENTO: 'badge-blue',
    CANCELADO: 'badge-gray',
  };
  return map[status] || 'badge-gray';
}

export function getStatusTurmaColor(status: string) {
  const map: Record<string, string> = {
    ATIVA: 'badge-green',
    ENCERRADA: 'badge-gray',
    AGUARDANDO: 'badge-yellow',
  };
  return map[status] || 'badge-gray';
}

export function mesAtual(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
