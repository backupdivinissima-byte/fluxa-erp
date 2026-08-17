import type { LancamentoFinanceiro, StatusConta } from '../types';

/** Formata um número como moeda brasileira (R$ 1.234,56). */
export function formatarMoeda(valor: number | undefined | null): string {
  return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Formata uma data ISO (yyyy-mm-dd) como dd/mm/aaaa, sem depender de fuso horário. */
export function formatarData(dataIso: string | undefined): string {
  if (!dataIso) return '—';
  const [ano, mes, dia] = dataIso.split('-');
  if (!ano || !mes || !dia) return dataIso;
  return `${dia}/${mes}/${ano}`;
}

/** Data de hoje no formato yyyy-mm-dd, usando o relógio do navegador. */
export function hojeIso(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Calcula o status "de verdade" de um lançamento: se ele está marcado como
 * pendente mas o vencimento já passou, mostra "vencido" — sem precisar de
 * nenhum job/rotina para manter isso atualizado no banco.
 */
export function statusEfetivo(lancamento: Pick<LancamentoFinanceiro, 'status' | 'vencimento'>): StatusConta {
  if (lancamento.status === 'pago') return 'pago';
  return lancamento.vencimento < hojeIso() ? 'vencido' : 'pendente';
}

export const rotuloStatus: Record<StatusConta, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  vencido: 'Vencido',
};

export const corStatus: Record<StatusConta, string> = {
  pendente: 'bg-amber-500/10 text-amber-600',
  pago: 'bg-teal-500/10 text-teal-500',
  vencido: 'bg-red-500/10 text-red-500',
};
