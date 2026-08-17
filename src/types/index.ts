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
}

export interface Fornecedor extends CadastroBase {
  razaoSocial?: string;
  endereco?: string;
  categoria?: string;
}

export interface Funcionario extends CadastroBase {
  cargo?: string;
  departamento?: string;
  dataAdmissao?: string;
}

export interface Vendedor extends CadastroBase {
  comissaoPercentual?: number;
  metaMensal?: number;
}

export type TipoCadastro = 'clientes' | 'fornecedores' | 'funcionarios' | 'vendedores';
