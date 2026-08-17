import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { assinarCadastro, criarRegistro, atualizarRegistro, excluirRegistro } from '../lib/repo';
import type { CadastroSchema } from '../lib/cadastroSchemas';
import type { CadastroBase } from '../types';

interface Props {
  schema: CadastroSchema;
}

export default function CadastroPage({ schema }: Props) {
  const { empresa } = useAuth();
  const [itens, setItens] = useState<CadastroBase[]>([]);
  const [busca, setBusca] = useState('');
  const [painelAberto, setPainelAberto] = useState(false);
  const [editando, setEditando] = useState<CadastroBase | null>(null);
  const [excluirAlvo, setExcluirAlvo] = useState<CadastroBase | null>(null);

  useEffect(() => {
    if (!empresa) return;
    const unsub = assinarCadastro(empresa.id, schema.tipo, setItens);
    return unsub;
  }, [empresa, schema.tipo]);

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return itens;
    return itens.filter((item) =>
      [item.nome, item.cpfCnpj, item.email].filter(Boolean).some((v) => v!.toLowerCase().includes(termo))
    );
  }, [itens, busca]);

  function abrirNovo() {
    setEditando(null);
    setPainelAberto(true);
  }

  function abrirEdicao(item: CadastroBase) {
    setEditando(item);
    setPainelAberto(true);
  }

  async function confirmarExclusao() {
    if (!empresa || !excluirAlvo) return;
    await excluirRegistro(empresa.id, schema.tipo, excluirAlvo.id);
    setExcluirAlvo(null);
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">{schema.titulo}</h1>
          <p className="text-sm text-ink-soft mt-1">{schema.descricao}</p>
        </div>
        <button
          onClick={abrirNovo}
          className="shrink-0 bg-gradient-to-br from-teal-500 to-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          + Novo {schema.tituloSingular}
        </button>
      </div>

      <div className="mb-4">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={`Buscar ${schema.titulo.toLowerCase()} por nome, documento ou e-mail...`}
          className="w-full max-w-md rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
        />
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface/60">
              {schema.campos
                .filter((c) => c.colunaTabela)
                .map((c) => (
                  <th key={c.key} className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">
                    {c.label}
                  </th>
                ))}
              <th className="text-left font-bold text-ink-soft text-xs uppercase tracking-wide px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {itensFiltrados.length === 0 && (
              <tr>
                <td colSpan={schema.campos.filter((c) => c.colunaTabela).length + 2} className="px-5 py-12 text-center text-ink-soft text-sm">
                  Nenhum {schema.tituloSingular} encontrado.
                </td>
              </tr>
            )}
            {itensFiltrados.map((item) => (
              <tr key={item.id} className="border-b border-line last:border-0 hover:bg-surface/40">
                {schema.campos
                  .filter((c) => c.colunaTabela)
                  .map((c) => (
                    <td key={c.key} className="px-5 py-3.5 text-ink">
                      {(item as unknown as Record<string, string | number | undefined>)[c.key] ?? (
                        <span className="text-ink-soft/50">—</span>
                      )}
                    </td>
                  ))}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                      item.ativo ? 'bg-teal-500/10 text-teal-500' : 'bg-ink-soft/10 text-ink-soft'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.ativo ? 'bg-teal-500' : 'bg-ink-soft'}`} />
                    {item.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                  <button onClick={() => abrirEdicao(item)} className="text-xs font-bold text-blue-600 hover:underline mr-4">
                    Editar
                  </button>
                  <button onClick={() => setExcluirAlvo(item)} className="text-xs font-bold text-red-500 hover:underline">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {painelAberto && (
        <FormPanel
          schema={schema}
          empresaId={empresa!.id}
          registro={editando}
          onClose={() => setPainelAberto(false)}
        />
      )}

      {excluirAlvo && (
        <ConfirmDialog
          titulo={`Excluir ${schema.tituloSingular}?`}
          mensagem={`Tem certeza que deseja excluir "${excluirAlvo.nome}"? Essa ação não pode ser desfeita.`}
          onCancelar={() => setExcluirAlvo(null)}
          onConfirmar={confirmarExclusao}
        />
      )}
    </div>
  );
}

function FormPanel({
  schema,
  empresaId,
  registro,
  onClose,
}: {
  schema: CadastroSchema;
  empresaId: string;
  registro: CadastroBase | null;
  onClose: () => void;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Record<string, string>>({
    defaultValues: (registro as unknown as Record<string, string>) ?? {},
  });

  async function onSubmit(dados: Record<string, string>) {
    if (registro) {
      await atualizarRegistro(empresaId, schema.tipo, registro.id, dados);
    } else {
      await criarRegistro(empresaId, schema.tipo, dados);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="px-6 py-5 border-b border-line flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">
            {registro ? `Editar ${schema.tituloSingular}` : `Novo ${schema.tituloSingular}`}
          </h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {schema.campos.map((campo) => (
            <div key={campo.key}>
              <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">
                {campo.label} {campo.obrigatorio && <span className="text-red-500">*</span>}
              </label>
              <input
                type={campo.tipo}
                placeholder={campo.placeholder}
                {...register(campo.key, { required: campo.obrigatorio })}
                className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
              {errors[campo.key] && <p className="text-xs text-red-500 mt-1">Campo obrigatório.</p>}
            </div>
          ))}
        </form>

        <div className="px-6 py-4 border-t border-line flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-line text-sm font-bold text-ink-soft py-2.5 hover:bg-surface"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white text-sm font-bold py-2.5 hover:opacity-90 disabled:opacity-60"
          >
            Salvar
          </button>
        </div>
      </div>
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
