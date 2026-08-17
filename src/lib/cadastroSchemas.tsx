import type { ReactNode } from 'react';
import type { TipoCadastro, Vendedor, Produto } from '../types';
import { formatarMoeda } from './financeiroUtils';

export interface CampoConfig {
  key: string;
  label: string;
  tipo: 'text' | 'email' | 'tel' | 'number' | 'date' | 'checkbox' | 'select-departamento' | 'select-cargo';
  obrigatorio?: boolean;
  colunaTabela?: boolean;
  placeholder?: string;
  /** Botão de ação ao lado do campo (busca/validação). */
  acao?: 'buscar-cnpj' | 'validar-whatsapp' | 'buscar-rede-social';
  /** Quando true, o campo só aparece na tabela (via `render`), não no formulário. */
  apenasTabela?: boolean;
  /** Render customizado para a coluna da tabela (usado por campos calculados). */
  render?: (item: Record<string, unknown>) => ReactNode;
}

export interface CadastroSchema {
  tipo: TipoCadastro;
  titulo: string;
  tituloSingular: string;
  descricao: string;
  campos: CampoConfig[];
  /** Mostra o toggle "Loja física" com busca de localização/avaliações no Maps. */
  temLojaFisica?: boolean;
  /** Mostra o editor de metas múltiplas (M1, M2, M3...) com comissão variável. */
  temMetasMultiplas?: boolean;
}

type TipoCadastroSimples = Exclude<TipoCadastro, 'contasPagar' | 'contasReceber'>;

export const cadastroSchemas: Record<TipoCadastroSimples, CadastroSchema> = {
  clientes: {
    tipo: 'clientes',
    titulo: 'Clientes',
    tituloSingular: 'cliente',
    descricao: 'Pessoas e empresas que compram de você.',
    temLojaFisica: true,
    campos: [
      { key: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, colunaTabela: true },
      { key: 'razaoSocial', label: 'Razão social', tipo: 'text' },
      {
        key: 'cpfCnpj',
        label: 'CPF/CNPJ',
        tipo: 'text',
        colunaTabela: true,
        acao: 'buscar-cnpj',
        placeholder: 'Só números',
      },
      { key: 'email', label: 'E-mail', tipo: 'email', colunaTabela: true },
      { key: 'telefone', label: 'Telefone', tipo: 'tel', colunaTabela: true },
      {
        key: 'whatsapp',
        label: 'WhatsApp',
        tipo: 'tel',
        acao: 'validar-whatsapp',
        placeholder: 'DDD + número',
      },
      {
        key: 'redeSocial',
        label: 'Rede social',
        tipo: 'text',
        acao: 'buscar-rede-social',
        placeholder: '@usuario ou nome da loja',
      },
      { key: 'cidade', label: 'Cidade', tipo: 'text' },
      { key: 'estado', label: 'Estado', tipo: 'text' },
      { key: 'endereco', label: 'Endereço', tipo: 'text' },
    ],
  },
  fornecedores: {
    tipo: 'fornecedores',
    titulo: 'Fornecedores',
    tituloSingular: 'fornecedor',
    descricao: 'Empresas e pessoas de quem você compra.',
    temLojaFisica: true,
    campos: [
      { key: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, colunaTabela: true },
      { key: 'razaoSocial', label: 'Razão social', tipo: 'text' },
      {
        key: 'cpfCnpj',
        label: 'CPF/CNPJ',
        tipo: 'text',
        colunaTabela: true,
        acao: 'buscar-cnpj',
        placeholder: 'Só números',
      },
      { key: 'categoria', label: 'Categoria', tipo: 'text', colunaTabela: true, placeholder: 'Ex: Matéria-prima, Embalagens...' },
      {
        key: 'redeSocial',
        label: 'Rede social',
        tipo: 'text',
        acao: 'buscar-rede-social',
        placeholder: '@usuario ou nome da empresa',
      },
      { key: 'email', label: 'E-mail', tipo: 'email', colunaTabela: true },
      { key: 'telefone', label: 'Telefone', tipo: 'tel' },
      { key: 'cidade', label: 'Cidade', tipo: 'text' },
      { key: 'estado', label: 'Estado', tipo: 'text' },
      { key: 'endereco', label: 'Endereço', tipo: 'text' },
    ],
  },
  funcionarios: {
    tipo: 'funcionarios',
    titulo: 'Funcionários',
    tituloSingular: 'funcionário',
    descricao: 'Sua equipe interna.',
    campos: [
      { key: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, colunaTabela: true },
      { key: 'cpfCnpj', label: 'CPF', tipo: 'text', colunaTabela: true },
      { key: 'cargo', label: 'Cargo', tipo: 'select-cargo', colunaTabela: true },
      { key: 'departamento', label: 'Departamento', tipo: 'select-departamento', colunaTabela: true },
      { key: 'dataAdmissao', label: 'Data de admissão', tipo: 'date' },
      { key: 'dataDemissao', label: 'Data de demissão', tipo: 'date' },
      { key: 'email', label: 'E-mail', tipo: 'email' },
      { key: 'telefone', label: 'Telefone', tipo: 'tel' },
    ],
  },
  vendedores: {
    tipo: 'vendedores',
    titulo: 'Vendedores',
    tituloSingular: 'vendedor',
    descricao: 'Quem vende para os seus clientes.',
    temMetasMultiplas: true,
    campos: [
      { key: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, colunaTabela: true },
      { key: 'cpfCnpj', label: 'CPF', tipo: 'text', colunaTabela: true },
      {
        key: 'metasResumo',
        label: 'Metas e comissões',
        tipo: 'text',
        colunaTabela: true,
        apenasTabela: true,
        render: (item) => {
          const metas = (item as unknown as Vendedor).metas;
          if (!metas || metas.length === 0) return <span className="text-ink-soft/50">—</span>;
          return metas.map((m) => `${m.nome}: ${m.comissaoPercentual ?? 0}%`).join(' · ');
        },
      },
      { key: 'email', label: 'E-mail', tipo: 'email' },
      { key: 'telefone', label: 'Telefone', tipo: 'tel' },
    ],
  },
  departamentos: {
    tipo: 'departamentos',
    titulo: 'Departamentos',
    tituloSingular: 'departamento',
    descricao: 'Departamentos da empresa, para usar no cadastro de funcionários (alinhado ao seu plano de contas).',
    campos: [
      { key: 'nome', label: 'Nome do departamento', tipo: 'text', obrigatorio: true, colunaTabela: true },
      { key: 'codigoContabil', label: 'Código contábil', tipo: 'text', colunaTabela: true, placeholder: 'Ex: 3.1.02' },
    ],
  },
  cargos: {
    tipo: 'cargos',
    titulo: 'Cargos',
    tituloSingular: 'cargo',
    descricao: 'Cargos da empresa, para usar no cadastro de funcionários (alinhado ao seu plano de contas).',
    campos: [
      { key: 'nome', label: 'Nome do cargo', tipo: 'text', obrigatorio: true, colunaTabela: true },
      { key: 'codigoContabil', label: 'Código contábil', tipo: 'text', colunaTabela: true, placeholder: 'Ex: 4.1.05' },
    ],
  },
  produtos: {
    tipo: 'produtos',
    titulo: 'Produtos',
    tituloSingular: 'produto',
    descricao: 'Itens do seu catálogo, com preço e quantidade em estoque.',
    campos: [
      { key: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, colunaTabela: true },
      { key: 'sku', label: 'SKU / código', tipo: 'text', colunaTabela: true, placeholder: 'Ex: COL-001' },
      { key: 'categoria', label: 'Categoria', tipo: 'text', colunaTabela: true, placeholder: 'Ex: Colares, Brincos...' },
      { key: 'unidade', label: 'Unidade', tipo: 'text', placeholder: 'Ex: un, par, kg...' },
      {
        key: 'precoVenda',
        label: 'Preço de venda (R$)',
        tipo: 'number',
        colunaTabela: true,
        render: (item) => formatarMoeda((item as unknown as Produto).precoVenda),
      },
      { key: 'precoCusto', label: 'Preço de custo (R$)', tipo: 'number' },
      { key: 'estoqueMinimo', label: 'Estoque mínimo', tipo: 'number', placeholder: 'Alerta quando a quantidade cair abaixo disso' },
      {
        key: 'quantidade',
        label: 'Quantidade em estoque',
        tipo: 'number',
        colunaTabela: true,
        render: (item) => {
          const produto = item as unknown as Produto;
          const qtd = produto.quantidade ?? 0;
          const baixo = produto.estoqueMinimo != null && qtd <= produto.estoqueMinimo;
          return (
            <span className={baixo ? 'inline-flex items-center gap-1.5 font-bold text-red-500' : ''}>
              {qtd}
              {baixo && <span title="Estoque baixo">⚠️</span>}
            </span>
          );
        },
      },
    ],
  },
};
