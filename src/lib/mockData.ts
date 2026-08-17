import type { Cliente, Fornecedor, Funcionario, Vendedor } from '../types';

// Dados de demonstração — usados apenas quando não há projeto Firebase
// configurado ainda (ambiente local de desenvolvimento/preview). Assim que
// o projeto Firebase da Fluxa existir, o app passa a usar dados reais
// automaticamente (ver src/lib/repo.ts).

const now = '2026-08-17T12:00:00.000Z';

export const clientesMock: Cliente[] = [
  { id: '1', nome: 'Ateliê Bela Vista', razaoSocial: 'Ateliê Bela Vista Ltda', cpfCnpj: '12.345.678/0001-90', email: 'contato@belavista.com.br', telefone: '(31) 99123-4567', cidade: 'Belo Horizonte', estado: 'MG', ativo: true, criadoEm: now, atualizadoEm: now },
  { id: '2', nome: 'Joana Ferreira', cpfCnpj: '123.456.789-00', email: 'joana.ferreira@email.com', telefone: '(11) 98877-6655', cidade: 'São Paulo', estado: 'SP', ativo: true, criadoEm: now, atualizadoEm: now },
  { id: '3', nome: 'Semijoias Cristal', razaoSocial: 'Cristal Comércio de Semijoias ME', cpfCnpj: '98.765.432/0001-10', email: 'compras@cristal.com.br', telefone: '(21) 97766-5544', cidade: 'Rio de Janeiro', estado: 'RJ', ativo: false, criadoEm: now, atualizadoEm: now },
];

export const fornecedoresMock: Fornecedor[] = [
  { id: '1', nome: 'Metais & Cia', razaoSocial: 'Metais & Cia Distribuidora', cpfCnpj: '11.222.333/0001-44', categoria: 'Matéria-prima', email: 'vendas@metaisecia.com.br', telefone: '(11) 3344-5566', cidade: 'São Paulo', estado: 'SP', ativo: true, criadoEm: now, atualizadoEm: now },
  { id: '2', nome: 'Embalagens Ouro', razaoSocial: 'Ouro Embalagens Ltda', cpfCnpj: '22.333.444/0001-55', categoria: 'Embalagens', email: 'contato@embalagensouro.com.br', telefone: '(31) 3322-1100', cidade: 'Contagem', estado: 'MG', ativo: true, criadoEm: now, atualizadoEm: now },
];

export const funcionariosMock: Funcionario[] = [
  { id: '1', nome: 'Patrícia Nunes', cpfCnpj: '234.567.891-00', cargo: 'Gerente de Operações', departamento: 'Operações', dataAdmissao: '2023-03-01', email: 'patricia@empresa.com.br', telefone: '(31) 99111-2233', ativo: true, criadoEm: now, atualizadoEm: now },
  { id: '2', nome: 'Rafael Souza', cpfCnpj: '345.678.912-00', cargo: 'Analista Financeiro', departamento: 'Financeiro', dataAdmissao: '2024-06-10', email: 'rafael@empresa.com.br', telefone: '(31) 99222-3344', ativo: true, criadoEm: now, atualizadoEm: now },
];

export const vendedoresMock: Vendedor[] = [
  { id: '1', nome: 'Miriam Rodrigues dos Santos', cpfCnpj: '456.789.123-00', comissaoPercentual: 5, metaMensal: 40000, email: 'miriam@empresa.com.br', telefone: '(31) 98888-1111', ativo: true, criadoEm: now, atualizadoEm: now },
  { id: '2', nome: 'Karolaine Letricia Gonçalves Gomes', cpfCnpj: '567.891.234-00', comissaoPercentual: 4, metaMensal: 30000, email: 'karolaine@empresa.com.br', telefone: '(31) 98888-2222', ativo: true, criadoEm: now, atualizadoEm: now },
];
