import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { assinarCadastro } from '../../lib/repo';
import { formatarMoeda, formatarData, hojeIso, statusEfetivo, rotuloStatus, corStatus } from '../../lib/financeiroUtils';
import type { LancamentoFinanceiro } from '../../types';

type LinhaFluxo = LancamentoFinanceiro & { origem: 'pagar' | 'receber' };

export default function FluxoDeCaixa() {
  const { empresa } = useAuth();
  const [contasPagar, setContasPagar] = useState<LancamentoFinanceiro[]>([]);
  const [contasReceber, setContasReceber] = useState<LancamentoFinanceiro[]>([]);

  useEffect(() => {
    if (!empresa) return;
    const unsub1 = assinarCadastro<LancamentoFinanceiro>(empresa.id, 'contasPagar', setContasPagar);
    const unsub2 = assinarCadastro<LancamentoFinanceiro>(empresa.id, 'contasReceber', setContasReceber);
    return () => {
      unsub1();
      unsub2();
    };
  }, [empresa]);

  const resumo = useMemo(() => {
    const somar = (itens: LancamentoFinanceiro[], statusAlvo: 'pendente' | 'vencido' | 'pago') =>
      itens.filter((i) => statusEfetivo(i) === statusAlvo).reduce((soma, i) => soma + i.valor, 0);

    const aPagar = somar(contasPagar, 'pendente') + somar(contasPagar, 'vencido');
    const aReceber = somar(contasReceber, 'pendente') + somar(contasReceber, 'vencido');
    const pago = somar(contasPagar, 'pago');
    const recebido = somar(contasReceber, 'pago');

    return {
      aPagar,
      aReceber,
      saldoRealizado: recebido - pago,
      saldoPrevisto: aReceber - aPagar,
    };
  }, [contasPagar, contasReceber]);

  const proximosVencimentos: LinhaFluxo[] = useMemo(() => {
    const combinados: LinhaFluxo[] = [
      ...contasPagar.map((i) => ({ ...i, origem: 'pagar' as const })),
      ...contasReceber.map((i) => ({ ...i, origem: 'receber' as const })),
    ];
    return combinados
      .filter((i) => statusEfetivo(i) !== 'pago')
      .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
      .slice(0, 10);
  }, [contasPagar, contasReceber]);

  return (
    <div className="p-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">Fluxo de caixa</h1>
        <p className="text-sm text-ink-soft mt-1">Visão geral de contas a pagar e a receber da empresa.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1">A receber</div>
          <div className="text-2xl font-extrabold text-teal-600">{formatarMoeda(resumo.aReceber)}</div>
          <div className="text-xs text-ink-soft mt-1">pendente + vencido</div>
        </div>
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1">A pagar</div>
          <div className="text-2xl font-extrabold text-red-500">{formatarMoeda(resumo.aPagar)}</div>
          <div className="text-xs text-ink-soft mt-1">pendente + vencido</div>
        </div>
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1">Saldo previsto</div>
          <div className={`text-2xl font-extrabold ${resumo.saldoPrevisto >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
            {formatarMoeda(resumo.saldoPrevisto)}
          </div>
          <div className="text-xs text-ink-soft mt-1">a receber − a pagar</div>
        </div>
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1">Saldo já realizado</div>
          <div className={`text-2xl font-extrabold ${resumo.saldoRealizado >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
            {formatarMoeda(resumo.saldoRealizado)}
          </div>
          <div className="text-xs text-ink-soft mt-1">recebido − pago</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-extrabold text-ink">Próximos vencimentos</h2>
        <div className="flex gap-4 text-xs font-bold">
          <Link to="/financeiro/contas-pagar" className="text-blue-600 hover:underline">
            Ver contas a pagar
          </Link>
          <Link to="/financeiro/contas-receber" className="text-blue-600 hover:underline">
            Ver contas a receber
          </Link>
        </div>
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface/60">
              <th className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">Descrição</th>
              <th className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">Tipo</th>
              <th className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">Vencimento</th>
              <th className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">Valor</th>
              <th className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {proximosVencimentos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-ink-soft text-sm">
                  Nenhum vencimento em aberto. 🎉
                </td>
              </tr>
            )}
            {proximosVencimentos.map((item) => {
              const status = statusEfetivo(item);
              return (
                <tr key={`${item.origem}-${item.id}`} className="border-b border-line last:border-0 hover:bg-surface/40">
                  <td className="px-5 py-3.5 text-ink font-semibold">{item.nome}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{item.origem === 'pagar' ? 'A pagar' : 'A receber'}</td>
                  <td className="px-5 py-3.5 text-ink">{formatarData(item.vencimento)}</td>
                  <td className="px-5 py-3.5 text-ink font-semibold">{formatarMoeda(item.valor)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${corStatus[status]}`}>
                      {rotuloStatus[status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-soft mt-3">Hoje: {formatarData(hojeIso())}</p>
    </div>
  );
}
