import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { assinarCadastro, criarRegistro, atualizarRegistro, excluirRegistro } from '../lib/repo';
import { formatarMoeda, formatarData, hojeIso, statusEfetivo, rotuloStatus, corStatus } from '../lib/financeiroUtils';
import type { CadastroBase, LancamentoFinanceiro, TipoCadastro } from '../types';

interface Props {
  tipo: Extract<TipoCadastro, 'contasPagar' | 'contasReceber'>;
  titulo: string;
  tituloSingular: string;
  descricao: string;
  /** Com quem esse lançamento se vincula: fornecedor (contas a pagar) ou cliente (contas a receber). */
  vinculo: 'cliente' | 'fornecedor';
  /** Verbo usado na ação rápida da lista ("pago" ou "recebido"). */
  verboQuitado: 'pago' | 'recebido';
}

export default function FinanceiroPage(props: Props) {
  return (
    <Routes>
      <Route index element={<ListaLancamentos {...props} />} />
      <Route path="novo" element={<FormularioLancamento {...props} />} />
      <Route path=":id/editar" element={<FormularioLancamento {...props} />} />
    </Routes>
  );
}

function ListaLancamentos({ tipo, titulo, descricao, tituloSingular, vinculo, verboQuitado }: Props) {
  const { empresa } = useAuth();
  const [itens, setItens] = useState<LancamentoFinanceiro[]>([]);
  const [vinculados, setVinculados] = useState<CadastroBase[]>([]);
  const [busca, setBusca] = useState('');
  const [excluirAlvo, setExcluirAlvo] = useState<LancamentoFinanceiro | null>(null);

  useEffect(() => {
    if (!empresa) return;
    const unsub = assinarCadastro<LancamentoFinanceiro>(empresa.id, tipo, setItens);
    return unsub;
  }, [empresa, tipo]);

  useEffect(() => {
    if (!empresa) return;
    const tipoVinculo = vinculo === 'cliente' ? 'clientes' : 'fornecedores';
    return assinarCadastro(empresa.id, tipoVinculo, setVinculados);
  }, [empresa, vinculo]);

  const nomeVinculado = (id?: string) => vinculados.find((v) => v.id === id)?.nome;

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const ordenados = [...itens].sort((a, b) => a.vencimento.localeCompare(b.vencimento));
    if (!termo) return ordenados;
    return ordenados.filter((item) =>
      [item.nome, item.categoria, nomeVinculado(vinculo === 'cliente' ? item.clienteId : item.fornecedorId)]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(termo))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens, busca, vinculados]);

  const totais = useMemo(() => {
    let pendente = 0;
    let vencido = 0;
    let pago = 0;
    for (const item of itens) {
      const status = statusEfetivo(item);
      if (status === 'pendente') pendente += item.valor;
      else if (status === 'vencido') vencido += item.valor;
      else pago += item.valor;
    }
    return { pendente, vencido, pago };
  }, [itens]);

  async function marcarComoQuitado(item: LancamentoFinanceiro) {
    if (!empresa) return;
    await atualizarRegistro<LancamentoFinanceiro>(empresa.id, tipo, item.id, { status: 'pago', dataPagamento: hojeIso() });
  }

  async function confirmarExclusao() {
    if (!empresa || !excluirAlvo) return;
    await excluirRegistro(empresa.id, tipo, excluirAlvo.id);
    setExcluirAlvo(null);
  }

  return (
    <div className="p-8 w-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">{titulo}</h1>
          <p className="text-sm text-ink-soft mt-1">{descricao}</p>
        </div>
        <Link
          to="novo"
          className="shrink-0 bg-gradient-to-br from-teal-500 to-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          + Novo lançamento
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 max-w-2xl">
        <div className="bg-white border border-line rounded-2xl p-4">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1">Pendente</div>
          <div className="text-xl font-extrabold text-amber-600">{formatarMoeda(totais.pendente)}</div>
        </div>
        <div className="bg-white border border-line rounded-2xl p-4">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1">Vencido</div>
          <div className="text-xl font-extrabold text-red-500">{formatarMoeda(totais.vencido)}</div>
        </div>
        <div className="bg-white border border-line rounded-2xl p-4">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-wide mb-1">
            {verboQuitado === 'pago' ? 'Pago' : 'Recebido'}
          </div>
          <div className="text-xl font-extrabold text-teal-500">{formatarMoeda(totais.pago)}</div>
        </div>
      </div>

      <div className="mb-4">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={`Buscar por descrição, categoria ou ${vinculo}...`}
          className="w-full max-w-md rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
        />
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface/60">
              <th className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">Descrição</th>
              <th className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">
                {vinculo === 'cliente' ? 'Cliente' : 'Fornecedor'}
              </th>
              <th className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">Vencimento</th>
              <th className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">Valor</th>
              <th className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {itensFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-ink-soft text-sm">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            )}
            {itensFiltrados.map((item) => {
              const status = statusEfetivo(item);
              const vinculadoId = vinculo === 'cliente' ? item.clienteId : item.fornecedorId;
              return (
                <tr key={item.id} className="border-b border-line last:border-0 hover:bg-surface/40">
                  <td className="px-5 py-3.5 text-ink font-semibold">{item.nome}</td>
                  <td className="px-5 py-3.5 text-ink">
                    {nomeVinculado(vinculadoId) ?? <span className="text-ink-soft/50">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-ink">{formatarData(item.vencimento)}</td>
                  <td className="px-5 py-3.5 text-ink font-semibold">{formatarMoeda(item.valor)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${corStatus[status]}`}>
                      {rotuloStatus[status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    {status !== 'pago' && (
                      <button
                        onClick={() => marcarComoQuitado(item)}
                        className="text-xs font-bold text-teal-600 hover:underline mr-4"
                      >
                        Marcar como {verboQuitado}
                      </button>
                    )}
                    <Link to={`${item.id}/editar`} className="text-xs font-bold text-blue-600 hover:underline mr-4">
                      Editar
                    </Link>
                    <button onClick={() => setExcluirAlvo(item)} className="text-xs font-bold text-red-500 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {excluirAlvo && (
        <ConfirmDialog
          titulo={`Excluir ${tituloSingular}?`}
          mensagem={`Tem certeza que deseja excluir "${excluirAlvo.nome}"? Essa ação não pode ser desfeita.`}
          onCancelar={() => setExcluirAlvo(null)}
          onConfirmar={confirmarExclusao}
        />
      )}
    </div>
  );
}

function FormularioLancamento({ tipo, titulo, tituloSingular, vinculo }: Props) {
  const { empresa } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const voltarParaLista = () => navigate(`/financeiro/${tipo === 'contasPagar' ? 'contas-pagar' : 'contas-receber'}`);

  const [registro, setRegistro] = useState<LancamentoFinanceiro | null>(null);
  const [carregando, setCarregando] = useState(Boolean(id));

  useEffect(() => {
    if (!id || !empresa) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    const unsub = assinarCadastro<LancamentoFinanceiro>(empresa.id, tipo, (itens) => {
      setRegistro(itens.find((i) => i.id === id) ?? null);
      setCarregando(false);
    });
    return unsub;
  }, [id, empresa, tipo]);

  if (carregando) {
    return <div className="p-8 text-sm text-ink-soft">Carregando...</div>;
  }

  if (id && !registro) {
    return (
      <div className="p-8">
        <p className="text-sm text-ink-soft mb-4">Não encontramos esse lançamento.</p>
        <button onClick={voltarParaLista} className="text-sm font-bold text-blue-600 hover:underline">
          ← Voltar para {titulo.toLowerCase()}
        </button>
      </div>
    );
  }

  // Só monta o formulário (e o useForm, com seus defaultValues) depois que o
  // registro já foi carregado — assim os campos vêm preenchidos ao editar.
  return (
    <FormularioConteudoFinanceiro
      tipo={tipo}
      titulo={titulo}
      tituloSingular={tituloSingular}
      vinculo={vinculo}
      empresaId={empresa!.id}
      registro={registro}
      onVoltar={voltarParaLista}
    />
  );
}

function FormularioConteudoFinanceiro({
  tipo,
  titulo,
  tituloSingular,
  vinculo,
  empresaId,
  registro,
  onVoltar,
}: Pick<Props, 'tipo' | 'titulo' | 'tituloSingular' | 'vinculo'> & {
  empresaId: string;
  registro: LancamentoFinanceiro | null;
  onVoltar: () => void;
}) {
  const [vinculados, setVinculados] = useState<CadastroBase[]>([]);

  useEffect(() => {
    const tipoVinculo = vinculo === 'cliente' ? 'clientes' : 'fornecedores';
    return assinarCadastro(empresaId, tipoVinculo, setVinculados);
  }, [empresaId, vinculo]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, any>>({
    defaultValues: (registro as unknown as Record<string, any>) ?? { status: 'pendente' },
  });

  // O <select> de cliente/fornecedor só ganha suas <option>s depois que
  // `vinculados` chega (busca assíncrona). Se isso acontece depois do
  // formulário montar, o valor inicial não "gruda" no DOM sozinho — então
  // reforça o valor aqui assim que as opções existirem.
  useEffect(() => {
    if (!registro || vinculados.length === 0) return;
    const campo = vinculo === 'cliente' ? 'clienteId' : 'fornecedorId';
    const valorAlvo = vinculo === 'cliente' ? registro.clienteId : registro.fornecedorId;
    if (valorAlvo) setValue(campo, valorAlvo);
  }, [vinculados, registro, vinculo, setValue]);

  async function onSubmit(dados: Record<string, any>) {
    const limpo: Partial<LancamentoFinanceiro> = {
      ...dados,
      valor: Number(dados.valor),
      dataPagamento: dados.status === 'pago' ? dados.dataPagamento || hojeIso() : undefined,
    };
    if (registro) {
      await atualizarRegistro<LancamentoFinanceiro>(empresaId, tipo, registro.id, limpo);
    } else {
      await criarRegistro<LancamentoFinanceiro>(empresaId, tipo, limpo);
    }
    onVoltar();
  }

  const statusAtual = watch('status');

  return (
    <div className="p-8 w-full">
      <button onClick={onVoltar} className="text-sm font-bold text-ink-soft hover:text-ink mb-4 inline-flex items-center gap-1.5">
        ← Voltar para {titulo.toLowerCase()}
      </button>

      <h1 className="text-2xl font-extrabold text-ink tracking-tight mb-6">
        {registro ? `Editar ${tituloSingular}` : `Novo ${tituloSingular}`}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl bg-white border border-line rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">
            Descrição <span className="text-red-500">*</span>
          </label>
          <input
            {...register('nome', { required: true })}
            placeholder={vinculo === 'cliente' ? 'Ex: Venda — nome do cliente' : 'Ex: Compra de matéria-prima'}
            className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
          {errors.nome && <p className="text-xs text-red-500 mt-1">Campo obrigatório.</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">
              Valor (R$) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('valor', { required: true })}
              className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
            {errors.valor && <p className="text-xs text-red-500 mt-1">Campo obrigatório.</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">
              Vencimento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('vencimento', { required: true })}
              className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
            {errors.vencimento && <p className="text-xs text-red-500 mt-1">Campo obrigatório.</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">Categoria</label>
            <input
              {...register('categoria')}
              placeholder="Ex: Vendas, Despesas fixas..."
              className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">
              {vinculo === 'cliente' ? 'Cliente' : 'Fornecedor'}
            </label>
            <select
              {...register(vinculo === 'cliente' ? 'clienteId' : 'fornecedorId')}
              className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
            >
              <option value="">Selecione...</option>
              {vinculados.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">Status</label>
            <select
              {...register('status')}
              className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
            >
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
          </div>
          {statusAtual === 'pago' && (
            <div>
              <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">Data do pagamento</label>
              <input
                type="date"
                {...register('dataPagamento')}
                className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">Observações</label>
          <textarea
            {...register('observacoes')}
            rows={3}
            className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onVoltar}
            className="flex-1 rounded-xl border border-line text-sm font-bold text-ink-soft py-2.5 hover:bg-surface"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white text-sm font-bold py-2.5 hover:opacity-90 disabled:opacity-60"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmDialog({
  titulo,
  mensagem,
  onCancelar,
  onConfirmar,
}: {
  titulo: string;
  mensagem: string;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-ink/30" onClick={onCancelar} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-base font-extrabold text-ink mb-2">{titulo}</h3>
        <p className="text-sm text-ink-soft mb-5">{mensagem}</p>
        <div className="flex gap-3">
          <button onClick={onCancelar} className="flex-1 rounded-xl border border-line text-sm font-bold text-ink-soft py-2.5 hover:bg-surface">
            Cancelar
          </button>
          <button onClick={onConfirmar} className="flex-1 rounded-xl bg-red-500 text-white text-sm font-bold py-2.5 hover:opacity-90">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
