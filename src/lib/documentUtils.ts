// Utilitários para os botões de "buscar/validar" dos cadastros: CNPJ, CPF,
// WhatsApp, redes sociais e localização no Google Maps.
//
// Importante sobre limites reais:
// - CNPJ tem uma fonte pública e gratuita (BrasilAPI, dados da Receita
//   Federal), então dá pra preencher os campos automaticamente.
// - CPF não tem — dados pessoais por CPF são protegidos por lei (LGPD) e só
//   empresas como Serasa/Big Data Corp vendem esse acesso. Por isso aqui só
//   validamos se o número é válido (dígito verificador), sem preencher nada.
// - Redes sociais (seguidores) e avaliações do Google Maps exigem chaves de
//   API pagas e um servidor por trás (não dá pra fazer isso só no navegador
//   de forma seria/seguindo os termos de uso). Por enquanto, os botões abrem
//   uma busca pronta numa nova aba pra agilizar a conferência manual.

export function somenteDigitos(valor: string | undefined | null): string {
  return (valor ?? '').replace(/\D/g, '');
}

/** Confere o dígito verificador de um CPF. Não confirma se a pessoa existe. */
export function cpfValido(cpfRaw: string): boolean {
  const cpf = somenteDigitos(cpfRaw);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number(cpf[10])) return false;

  return true;
}

export interface DadosCnpj {
  nome?: string;
  razaoSocial?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
}

interface RespostaBrasilApiCnpj {
  razao_social?: string;
  nome_fantasia?: string;
  email?: string;
  ddd_telefone_1?: string;
  municipio?: string;
  uf?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
}

/**
 * Busca os dados públicos de uma empresa pelo CNPJ na BrasilAPI (gratuita,
 * sem necessidade de chave — dados oficiais da Receita Federal).
 * Retorna `null` se o CNPJ não tiver 14 dígitos, não existir, ou se a busca
 * falhar por qualquer motivo (rede indisponível, etc.).
 */
export async function buscarDadosCnpj(cnpjRaw: string): Promise<DadosCnpj | null> {
  const cnpj = somenteDigitos(cnpjRaw);
  if (cnpj.length !== 14) return null;

  try {
    const resposta = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!resposta.ok) return null;
    const dados: RespostaBrasilApiCnpj = await resposta.json();

    const enderecoPartes = [dados.logradouro, dados.numero, dados.bairro].filter(Boolean);

    return {
      nome: dados.nome_fantasia || dados.razao_social || undefined,
      razaoSocial: dados.razao_social || undefined,
      email: dados.email || undefined,
      telefone: dados.ddd_telefone_1 || undefined,
      cidade: dados.municipio || undefined,
      estado: dados.uf || undefined,
      endereco: enderecoPartes.length ? enderecoPartes.join(', ') : undefined,
    };
  } catch {
    return null;
  }
}

/** Link do wa.me pra abrir uma conversa e confirmar se o número tem WhatsApp. */
export function linkWhatsapp(numeroRaw: string): string {
  let digitos = somenteDigitos(numeroRaw);
  if (digitos.length > 0 && digitos.length <= 11 && !digitos.startsWith('55')) {
    digitos = '55' + digitos;
  }
  return `https://wa.me/${digitos}`;
}

/** Busca no Google pelo @ ou nome informado, focando em redes sociais. */
export function linkBuscaRedeSocial(termoBusca: string): string {
  const termo = termoBusca.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(`${termo} instagram`)}`;
}

/** Busca no Google Maps pelo nome (e endereço, se houver) do estabelecimento. */
export function linkBuscaMapa(nome: string, endereco?: string): string {
  const termo = [nome, endereco].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/${encodeURIComponent(termo)}`;
}
