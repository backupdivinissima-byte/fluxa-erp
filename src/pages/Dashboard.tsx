import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assinarCadastro } from '../lib/repo';
import type { TipoCadastro } from '../types';

const cards: { tipo: TipoCadastro; label: string; icon: string }[] = [
  { tipo: 'clientes', label: 'Clientes', icon: '👤' },
  { tipo: 'fornecedores', label: 'Fornecedores', icon: '🚚' },
  { tipo: 'funcionarios', label: 'Funcionários', icon: '🧑‍💼' },
  { tipo: 'vendedores', label: 'Vendedores', icon: '🏷️' },
];

export default function Dashboard() {
  const { empresa, perfil } = useAuth();
  const [contagens, setContagens] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!empresa) return;
    const unsubs = cards.map((c) =>
      assinarCadastro(empresa.id, c.tipo, (items) =>
        setContagens((prev) => ({ ...prev, [c.tipo]: items.length }))
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [empresa]);

  return (
    <div className="p-8 w-full">
      <h1 className="text-2xl font-extrabold text-ink tracking-tight">
        Olá, {perfil?.nome?.split(' ')[0]} 👋
      </h1>
      <p className="text-sm text-ink-soft mt-1 mb-8">
        Aqui está o resumo dos cadastros de <b>{empresa?.nome}</b>.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
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

      <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="text-sm font-bold uppercase tracking-wide opacity-80 mb-1">Próxima etapa</div>
        <h2 className="text-lg font-extrabold mb-2">Módulo Financeiro</h2>
        <p className="text-sm opacity-90 max-w-lg">
          Com os cadastros prontos, o próximo passo é contas a pagar e a receber,
          fluxo de caixa — usando estes mesmos clientes e fornecedores que você já cadastrou aqui.
        </p>
      </div>
    </div>
  );
}
