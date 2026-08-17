// ===== Núcleo multiempresa =====

export type PapelUsuario = 'admin' | 'gestor' | 'operador';

export interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  criadoEm: string; // ISO date
  plano: 'trial' | 'starter' | 'pro';
}

export interface UsuarioPerfil {
  uid: string;
  nome: string;
  email: string;
  empresaId: string;
  papel: PapelUsuario;
  criadoEm: string;
}

// ===== Cadastros =====

export interface CadastroBase {
  id: string;
  nome: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  observacoes?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Cliente extends CadastroBase {
  razaoSocial?: string;
  endereco?: string;
  whatsapp?: string;
  redeSocial?: string;
  lojaFisica?: boolean;
}

export interface Fornecedor extends CadastroBase {
  razaoSocial?: string;
  endereco?: string;
  categoria?: string;
  redeSocial?: string;
  lojaFisica?: boolean;
}

export interface Funcionario extends CadastroBase {
  cargo?: string;
  departamento?: string;
  dataAdmissao?: string;
  dataDemissao?: string;
}

export interface MetaVendedor {
  id: string;
  nome: string; // Ex: M1, M2, M3...
  valorMeta?: number;
  comissaoPercentual?: number;
}

export interface Vendedor extends CadastroBase {
  /** @deprecated substituído por `metas` (permite mais de uma meta/comissão) */
  comissaoPercentual?: number;
  /** @deprecated substituído por `metas` (permite mais de uma meta/comissão) */
  metaMensal?: number;
  metas?: MetaVendedor[];
}

// ===== Cadastros contábeis (departamentos e cargos) =====

export interface Departamento extends CadastroBase {
  codigoContabil?: string;
}

export interface Cargo extends CadastroBase {
  codigoContabil?: string;
}

export type TipoCadastro =
  | 'clientes'
  | 'fornecedores'
  | 'funcionarios'
  | 'vendedores'
  | 'departamentos'
  | 'cargos';
