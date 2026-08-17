import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { CadastroBase, TipoCadastro } from '../types';
import {
  clientesMock,
  fornecedoresMock,
  funcionariosMock,
  vendedoresMock,
  departamentosMock,
  cargosMock,
  produtosMock,
  contasPagarMock,
  contasReceberMock,
} from './mockData';

const mockPorTipo: Record<TipoCadastro, CadastroBase[]> = {
  clientes: clientesMock,
  fornecedores: fornecedoresMock,
  funcionarios: funcionariosMock,
  vendedores: vendedoresMock,
  departamentos: departamentosMock,
  cargos: cargosMock,
  produtos: produtosMock,
  contasPagar: contasPagarMock,
  contasReceber: contasReceberMock,
};

// Assina a lista de registros de um cadastro (clientes, fornecedores, etc.)
// dentro da empresa atual. Em modo demo (sem Firebase configurado ainda),
// devolve os dados de exemplo direto, sem round-trip de rede.
export function assinarCadastro<T extends CadastroBase>(
  empresaId: string,
  tipo: TipoCadastro,
  onData: (items: T[]) => void
): () => void {
  if (!isFirebaseConfigured) {
    onData(mockPorTipo[tipo] as T[]);
    return () => {};
  }
  const ref = collection(db, 'companies', empresaId, tipo);
  const q = query(ref, orderBy('nome'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
    onData(items);
  });
}

export async function criarRegistro<T extends CadastroBase = CadastroBase>(
  empresaId: string,
  tipo: TipoCadastro,
  dados: Partial<T>
) {
  if (!isFirebaseConfigured) return;
  const ref = collection(db, 'companies', empresaId, tipo);
  await addDoc(ref, {
    ...dados,
    ativo: (dados as Partial<CadastroBase>).ativo ?? true,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

export async function atualizarRegistro<T extends CadastroBase = CadastroBase>(
  empresaId: string,
  tipo: TipoCadastro,
  id: string,
  dados: Partial<T>
) {
  if (!isFirebaseConfigured) return;
  const ref = doc(db, 'companies', empresaId, tipo, id);
  await updateDoc(ref, { ...dados, atualizadoEm: serverTimestamp() });
}

export async function excluirRegistro(empresaId: string, tipo: TipoCadastro, id: string) {
  if (!isFirebaseConfigured) return;
  const ref = doc(db, 'companies', empresaId, tipo, id);
  await deleteDoc(ref);
}
