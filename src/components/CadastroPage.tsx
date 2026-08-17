import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { assinarCadastro, criarRegistro, atualizarRegistro, excluirRegistro } from '../lib/repo';
import type { CadastroSchema } from '../lib/cadastroSchemas';
import type { CadastroBase, MetaVendedor } from '../types';
import {
  somenteDigitos,
  cpfValido,
  buscarDadosCnpj,
  linkWhatsapp,
  linkBuscaRedeSocial,
  linkBuscaMapa,
} from '../lib/documentUtils';

interface Props {
  schema: CadastroSchema;
}

// Cada cadastro (Clientes, Fornecedores...) usa três telas próprias, sempre
// no mesmo padrão: lista (tela cheia), "novo registro" (página dedicada,
// não um painel flutuante) e "editar registro". Ao salvar ou cancelar, o
// formulário sempre volta para a lista — igual em todas as telas do sistema.
export default function CadastroPage({ schema }: Props) {
  return (
    <Routes>
      <Route index element={<ListaCadastro schema={schema} />} />
      <Route path="novo" element={<FormularioCadastro schema={schema} />} />
      <Route path=":id/editar" element={<FormularioCadastro schema={schema} />} />
    </Routes>
  );
}

function ListaCadastro({ schema }: Props) {
  const { empresa } = useAuth();
  const [itens, setItens] = useState<CadastroBase[]>([]);
  const [busca, setBusca] = useState('');
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

  async function confirmarExclusao() {
    if (!empresa || !excluirAlvo) return;
    await excluirRegistro(empresa.id, schema.tipo, excluirAlvo.id);
    setExcluirAlvo(null);
  }

  const colunas = schema.campos.filter((c) => c.colunaTabela);

  return (
    <div className="p-8 w-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">{schema.titulo}</h1>
          <p className="text-sm text-ink-soft mt-1">{schema.descricao}</p>
        </div>
        <Link
          to="novo"
          className="shrink-0 bg-gradient-to-br from-teal-500 to-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          + Novo {schema.tituloSingular}
        </Link>
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
              {colunas.map((c) => (
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
                <td colSpan={colunas.length + 2} className="px-5 py-12 text-center text-ink-soft text-sm">
                  Nenhum {schema.tituloSingular} encontrado.
                </td>
              </tr>
            )}
            {itensFiltrados.map((item) => (
              <tr key={item.id} className="border-b border-line last:border-0 hover:bg-surface/40">
                {colunas.map((c) => (
                  <td key={c.key} className="px-5 py-3.5 text-ink">
                    {c.render
                      ? c.render(item as unknown as Record<string, unknown>)
                      : ((item as unknown as Record<string, string | number | undefined>)[c.key] ?? (
                          <span className="text-ink-soft/50">—</span>
                        ))}
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
                  <Link to={`${item.id}/editar`} className="text-xs font-bold text-blue-600 hover:underline mr-4">
                    Editar
                  </Link>
                  <button onClick={() => setExcluirAlvo(item)} className="text-xs font-bold text-red-500 hover:underline">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

function FormularioCadastro({ schema }: Props) {
  const { empresa } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const voltarParaLista = () => navigate(`/cadastros/${schema.tipo}`);

  const [registro, setRegistro] = useState<CadastroBase | null>(null);
  const [carregando, setCarregando] = useState(Boolean(id));

  useEffect(() => {
    if (!id || !empresa) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    const unsub = assinarCadastro<CadastroBase>(empresa.id, schema.tipo, (itens) => {
      setRegistro(itens.find((i) => i.id === id) ?? null);
      setCarregando(false);
    });
    return unsub;
  }, [id, empresa, schema.tipo]);

  if (carregando) {
    return <div className="p-8 text-sm text-ink-soft">Carregando...</div>;
  }

  if (id && !registro) {
    return (
      <div className="p-8">
        <p className="text-sm text-ink-soft mb-4">Não encontramos esse {schema.tituloSingular}.</p>
        <button onClick={voltarParaLista} className="text-sm font-bold text-blue-600 hover:underline">
          ← Voltar para {schema.titulo.toLowerCase()}
        </button>
      </div>
    );
  }

  return (
    <FormularioConteudo
      schema={schema}
      empresaId={empresa!.id}
      registro={registro}
      onSalvo={voltarParaLista}
      onCancelar={voltarParaLista}
    />
  );
}

function FormularioConteudo({
  schema,
  empresaId,
  registro,
  onSalvo,
  onCancelar,
}: {
  schema: CadastroSchema;
  empresaId: string;
  registro: CadastroBase | null;
  onSalvo: () => void;
  onCancelar: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, any>>({
    defaultValues: (registro as unknown as Record<string, any>) ?? {},
  });

  const { fields: metaFields, append: appendMeta, remove: removeMeta } = useFieldArray({
    control,
    name: 'metas',
  });

  const precisaDepartamentos = schema.campos.some((c) => c.tipo === 'select-departamento');
  const precisaCargos = schema.campos.some((c) => c.tipo === 'select-cargo');
  const [departamentosOpcoes, setDepartamentosOpcoes] = useState<CadastroBase[]>([]);
  const [cargosOpcoes, setCargosOpcoes] = useState<CadastroBase[]>([]);

  useEffect(() => {
    if (!precisaDepartamentos) return;
    return assinarCadastro(empresaId, 'departamentos', setDepartamentosOpcoes);
  }, [precisaDepartamentos, empresaId]);

  useEffect(() => {
    if (!precisaCargos) return;
    return assinarCadastro(empresaId, 'cargos', setCargosOpcoes);
  }, [precisaCargos, empresaId]);

  const [buscandoDocumento, setBuscandoDocumento] = useState(false);
  const [mensagemDocumento, setMensagemDocumento] = useState<string | null>(null);
  const [documentoOk, setDocumentoOk] = useState(true);

  async function aoBuscarDocumento() {
    const digitos = somenteDigitos(String(getValues('cpfCnpj') || ''));

    if (digitos.length === 14) {
      setBuscandoDocumento(true);
      setMensagemDocumento(null);
      const dados = await buscarDadosCnpj(digitos);
      setBuscandoDocumento(false);
      if (dados) {
        if (dados.nome) setValue('nome', dados.nome, { shouldDirty: true });
        if (dados.razaoSocial) setValue('razaoSocial', dados.razaoSocial, { shouldDirty: true });
        if (dados.email) setValue('email', dados.email, { shouldDirty: true });
        if (dados.telefone) setValue('telefone', dados.telefone, { shouldDirty: true });
        if (dados.cidade) setValue('cidade', dados.cidade, { shouldDirty: true });
        if (dados.estado) setValue('estado', dados.estado, { shouldDirty: true });
        if (dados.endereco) setValue('endereco', dados.endereco, { shouldDirty: true });
        setDocumentoOk(true);
        setMensagemDocumento('✓ Dados da empresa preenchidos automaticamente (fonte: Receita Federal).');
      } else {
        setDocumentoOk(false);
        setMensagemDocumento('Não encontramos esse CNPJ (ou a busca falhou agora). Confira o número ou preencha manualmente.');
      }
    } else if (digitos.length === 11) {
      const valido = cpfValido(digitos);
      setDocumentoOk(valido);
      setMensagemDocumento(
        valido
          ? '✓ CPF válido.'
          : 'CPF inválido — confira o número digitado. (Não existe busca automática de dados por CPF: é protegido por lei.)'
      );
    } else {
      setDocumentoOk(false);
      setMensagemDocumento('Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) completo e clique em Buscar.');
    }
  }

  async function onSubmit(dados: Record<string, any>) {
    const limpo = { ...dados };
    if (Array.isArray(limpo.metas)) {
      limpo.metas = limpo.metas.map((m: MetaVendedor) => ({
        ...m,
        valorMeta: Number.isFinite(m.valorMeta) ? m.valorMeta : undefined,
        comissaoPercentual: Number.isFinite(m.comissaoPercentual) ? m.comissaoPercentual : undefined,
      }));
    }
    if (registro) {
      await atualizarRegistro(empresaId, schema.tipo, registro.id, limpo);
    } else {
      await criarRegistro(empresaId, schema.tipo, limpo);
    }
    onSalvo();
  }

  const lojaFisicaMarcada = Boolean(watch('lojaFisica'));

  return (
    <div className="p-8 w-full">
      <button onClick={onCancelar} className="text-sm font-bold text-ink-soft hover:text-ink mb-4 inline-flex items-center gap-1.5">
        ← Voltar para {schema.titulo.toLowerCase()}
      </button>

      <h1 className="text-2xl font-extrabold text-ink tracking-tight mb-6">
        {registro ? `Editar ${schema.tituloSingular}` : `Novo ${schema.tituloSingular}`}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl bg-white border border-line rounded-2xl p-6 space-y-4">
        {schema.campos
          .filter((campo) => !campo.apenasTabela)
          .map((campo) => {
            if (campo.tipo === 'checkbox') {
              return (
                <label key={campo.key} className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <input type="checkbox" {...register(campo.key)} className="w-4 h-4 rounded border-line" />
                  {campo.label}
                </label>
              );
            }

            if (campo.tipo === 'select-departamento' || campo.tipo === 'select-cargo') {
              const opcoes = campo.tipo === 'select-departamento' ? departamentosOpcoes : cargosOpcoes;
              const rotulo = campo.tipo === 'select-departamento' ? 'departamento' : 'cargo';
              return (
                <div key={campo.key}>
                  <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">
                    {campo.label} {campo.obrigatorio && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    {...register(campo.key, { required: campo.obrigatorio })}
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
                  >
                    <option value="">Selecione...</option>
                    {opcoes.map((o) => (
                      <option key={o.id} value={o.nome}>
                        {o.nome}
                      </option>
                    ))}
                  </select>
                  {opcoes.length === 0 && (
                    <p className="text-xs text-ink-soft mt-1">
                      Nenhum {rotulo} cadastrado ainda — cadastre em "{rotulo === 'departamento' ? 'Departamentos' : 'Cargos'}" no menu.
                    </p>
                  )}
                  {errors[campo.key] && <p className="text-xs text-red-500 mt-1">Campo obrigatório.</p>}
                </div>
              );
            }

            return (
              <div key={campo.key}>
                <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide mb-1.5">
                  {campo.label} {campo.obrigatorio && <span className="text-red-500">*</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type={campo.tipo}
                    placeholder={campo.placeholder}
                    {...register(campo.key, { required: campo.obrigatorio })}
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  />
                  {campo.acao === 'buscar-cnpj' && (
                    <button
                      type="button"
                      onClick={aoBuscarDocumento}
                      disabled={buscandoDocumento}
                      className="shrink-0 rounded-xl border border-line px-3 text-xs font-bold text-blue-600 hover:bg-surface disabled:opacity-60"
                    >
                      {buscandoDocumento ? '...' : 'Buscar'}
                    </button>
                  )}
                  {campo.acao === 'validar-whatsapp' && (
                    <button
                      type="button"
                      onClick={() => window.open(linkWhatsapp(String(watch('whatsapp') || '')), '_blank', 'noopener')}
                      className="shrink-0 rounded-xl border border-line px-3 text-xs font-bold text-teal-600 hover:bg-surface"
                    >
                      Abrir
                    </button>
                  )}
                  {campo.acao === 'buscar-rede-social' && (
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          linkBuscaRedeSocial(String(watch('redeSocial') || watch('nome') || '')),
                          '_blank',
                          'noopener'
                        )
                      }
                      className="shrink-0 rounded-xl border border-line px-3 text-xs font-bold text-blue-600 hover:bg-surface"
                    >
                      Buscar
                    </button>
                  )}
                </div>
                {campo.key === 'cpfCnpj' && mensagemDocumento && (
                  <p className={`text-xs mt-1 ${documentoOk ? 'text-teal-600' : 'text-red-500'}`}>{mensagemDocumento}</p>
                )}
                {campo.acao === 'validar-whatsapp' && (
                  <p className="text-xs text-ink-soft mt-1">Abre uma conversa nova pra você confirmar se o número tem WhatsApp.</p>
                )}
                {campo.acao === 'buscar-rede-social' && (
                  <p className="text-xs text-ink-soft mt-1">Abre uma busca pronta no Google — confira e cole o @ encontrado aqui.</p>
                )}
                {errors[campo.key] && <p className="text-xs text-red-500 mt-1">Campo obrigatório.</p>}
              </div>
            );
          })}

        {schema.temLojaFisica && (
          <div className="border-t border-line pt-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink">
              <input type="checkbox" {...register('lojaFisica')} className="w-4 h-4 rounded border-line" />
              É uma loja física?
            </label>
            {lojaFisicaMarcada && (
              <button
                type="button"
                onClick={() =>
                  window.open(
                    linkBuscaMapa(String(watch('nome') || ''), String(watch('endereco') || '')),
                    '_blank',
                    'noopener'
                  )
                }
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                📍 Buscar localização e avaliações no Google Maps
              </button>
            )}
          </div>
        )}

        {schema.temMetasMultiplas && (
          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-ink-soft uppercase tracking-wide">Metas e comissões</label>
              <button
                type="button"
                onClick={() =>
                  appendMeta({
                    id: `m${metaFields.length + 1}-${Math.random().toString(36).slice(2, 7)}`,
                    nome: `M${metaFields.length + 1}`,
                    valorMeta: undefined,
                    comissaoPercentual: undefined,
                  })
                }
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                + Adicionar meta
              </button>
            </div>
            <div className="space-y-3">
              {metaFields.length === 0 && <p className="text-xs text-ink-soft">Nenhuma meta cadastrada ainda.</p>}
              {metaFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end bg-surface/60 rounded-xl p-3">
                  <div>
                    <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1">Nome</label>
                    <input
                      {...register(`metas.${index}.nome`)}
                      placeholder="M1"
                      className="w-full rounded-lg border border-line px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1">Meta (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`metas.${index}.valorMeta`, { valueAsNumber: true })}
                      className="w-full rounded-lg border border-line px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-soft uppercase mb-1">Comissão (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`metas.${index}.comissaoPercentual`, { valueAsNumber: true })}
                      className="w-full rounded-lg border border-line px-2 py-1.5 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMeta(index)}
                    className="text-red-500 text-xs font-bold hover:underline pb-2"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancelar}
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
