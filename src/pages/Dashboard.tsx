import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { assinarCadastro } from '../lib/repo';
import { formatarMoeda, statusEfetivo } from '../lib/financeiroUtils';
import type { LancamentoFinanceiro, TipoCadastro } from '../types';

const cards: { tipo: TipoCadastro; label: string; icon: string }[] = [
  { tipo: 'clientes', label: 'Clientes', icon: '👤' },
  { tipo: 'fornecedores', label: 'Fornecedores', icon: '🚚' },
  { tipo: 'funcionarios', label: 'Funcionários', icon: '🧑‍💼' },
  { tipo: 'vendedores', label: 'Vendedores', icon: '🏷️' },
];

export default function Dashboard() {
  const { empresa, perfil } = useAuth();
  const [contagens, setContagens] = useState<Record<string, number>>({});
  const [contasPagar, setContasPagar] = useState<LancamentoFinanceiro[]>([]);
  const [contasReceber, setContasReceber] = useState<LancamentoFinanceiro[]>([]);

  useEffect(() => {
    if (!empresa) return;
    const unsubs = cards.map((c) =>
      assinarCadastro(empresa.id, c.tipo, (items) =>
        setContagens((prev) => ({ ...prev, [c.tipo]: items.length }))
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [empresa]);

  useEffect(() => {
    if (!empresa) return;
    const unsub1 = assinarCadastro<LancamentoFinanceiro>(empresa.id, 'contasPagar', setContasPagar);
    const unsub2 = assinarCadastro<LancamentoFinanceiro>(empresa.id, 'contasReceber', setContasReceber);
    return () => {
      unsub1();
      unsub2();
    };
  }, [empresa]);

  const resumoFinanceiro = useMemo(() => {
    const emAberto = (itens: LancamentoFinanceiro[]) =>
      itens.filter((i) => statusEfetivo(i) !== 'pago').reduce((soma, i) => soma + i.valor, 0);
    const vencidos = (itens: LancamentoFinanceiro[]) => itens.filter((i) => statusEfetivo(i) === 'vencido').length;

    const aPagar = emAberto(contasPagar);
    const aReceber = emAberto(contasReceber);
    return {
      aPagar,
      aReceber,
      saldoPrevisto: aReceber - aPagar,
      vencidos: vencidos(contasPagar) + vencidos(contasReceber),
    };
  }, [contasPagar, contasReceber]);

  return (
    <div className="p-8 w-full">
      <h1 className="text-2xl font-extrabold text-ink tracking-tight">
        Olá, {perfil?.nome?.split(' ')[0]} 👋
      </h1>
      <p className="text-sm text-ink-soft mt-1 mb-8">
        Aqui está o resumo da <b>{empresa?.nome}</b>.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.tipo} className="bg-white border border-line rounded-2xl p-5">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-3xl font-extrabold text-ink tracking-tight">
              {contagens[c.tipo] ?? '—'}
            </div>
            <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-extrabold text-ink">Financeiro</h2>
        <Link to="/financeiro/fluxo-caixa" className="text-xs font-bold text-blue-600 hover:underline">
          Ver fluxo de caixa completo →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1">A receber</div>
          <div className="text-2xl font-extrabold text-teal-600">{formatarMoeda(resumoFinanceiro.aReceber)}</div>
        </div>
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1">A pagar</div>
          <div className="text-2xl font-extrabold text-red-500">{formatarMoeda(resumoFinanceiro.aPagar)}</div>
        </div>
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1">Saldo previsto</div>
          <div className={`text-2xl font-extrabold ${resumoFinanceiro.saldoPrevisto >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
            {formatarMoeda(resumoFinanceiro.saldoPrevisto)}
          </div>
        </div>
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1">Contas vencidas</div>
          <div className={`text-2xl font-extrabold ${resumoFinanceiro.vencidos > 0 ? 'text-red-500' : 'text-ink'}`}>
            {resumoFinanceiro.vencidos}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="text-sm font-bold uppercase tracking-wide opacity-80 mb-1">Próxima etapa</div>
        <h2 className="text-lg font-extrabold mb-2">Módulo Estoque</h2>
        <p className="text-sm opacity-90 max-w-lg">
          Com cadastros e financeiro prontos, o próximo passo é o controle de produtos e estoque —
          para depois ligar tudo com compras e vendas.
        </p>
      </div>
    </div>
  );
}
