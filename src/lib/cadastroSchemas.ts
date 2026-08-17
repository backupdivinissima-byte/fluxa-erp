import type { TipoCadastro } from '../types';

export interface CampoConfig {
  key: string;
  label: string;
  tipo: 'text' | 'email' | 'tel' | 'number' | 'date';
  obrigatorio?: boolean;
  colunaTabela?: boolean;
  placeholder?: string;
}

export interface CadastroSchema {
  tipo: TipoCadastro;
  titulo: string;
  tituloSingular: string;
  descricao: string;
  campos: CampoConfig[];
}

export const cadastroSchemas: Record<TipoCadastro, CadastroSchema> = {
  clientes: {
    tipo: 'clientes',
    titulo: 'Clientes',
    tituloSingular: 'cliente',
    descricao: 'Pessoas e empresas que compram de você.',
    campos: [
      { key: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, colunaTabela: true },
      { key: 'razaoSocial', label: 'Razão social', tipo: 'text' },
      { key: 'cpfCnpj', label: 'CPF/CNPJ', tipo: 'text', colunaTabela: true },
      { key: 'email', label: 'E-mail', tipo: 'email', colunaTabela: true },
      { key: 'telefone', label: 'Telefone', tipo: 'tel', colunaTabela: true },
      { key: 'cidade', label: 'Cidade', tipo: 'text' },
      { key: 'estado', label: 'Estado', tipo: 'text' },
    ],
  },
  fornecedores: {
    tipo: 'fornecedores',
    titulo: 'Fornecedores',
    tituloSingular: 'fornecedor',
    descricao: 'Empresas e pessoas de quem você compra.',
    campos: [
      { key: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, colunaTabela: true },
      { key: 'razaoSocial', label: 'Razão social', tipo: 'text' },
      { key: 'cpfCnpj', label: 'CPF/CNPJ', tipo: 'text', colunaTabela: true },
      { key: 'categoria', label: 'Categoria', tipo: 'text', colunaTabela: true, placeholder: 'Ex: Matéria-prima, Embalagens...' },
      { key: 'email', label: 'E-mail', tipo: 'email', colunaTabela: true },
      { key: 'telefone', label: 'Telefone', tipo: 'tel' },
      { key: 'cidade', label: 'Cidade', tipo: 'text' },
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
      { key: 'cargo', label: 'Cargo', tipo: 'text', colunaTabela: true },
      { key: 'departamento', label: 'Departamento', tipo: 'text', colunaTabela: true },
      { key: 'dataAdmissao', label: 'Data de admissão', tipo: 'date' },
      { key: 'email', label: 'E-mail', tipo: 'email' },
      { key: 'telefone', label: 'Telefone', tipo: 'tel' },
    ],
  },
  vendedores: {
    tipo: 'vendedores',
    titulo: 'Vendedores',
    tituloSingular: 'vendedor',
    descricao: 'Quem vende para os seus clientes.',
    campos: [
      { key: 'nome', label: 'Nome', tipo: 'text', obrigatorio: true, colunaTabela: true },
      { key: 'cpfCnpj', label: 'CPF', tipo: 'text', colunaTabela: true },
      { key: 'comissaoPercentual', label: 'Comissão (%)', tipo: 'number', colunaTabela: true },
      { key: 'metaMensal', label: 'Meta mensal (R$)', tipo: 'number', colunaTabela: true },
      { key: 'email', label: 'E-mail', tipo: 'email' },
      { key: 'telefone', label: 'Telefone', tipo: 'tel' },
    ],
  },
};
