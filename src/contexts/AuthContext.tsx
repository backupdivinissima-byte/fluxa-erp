import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import type { Empresa, UsuarioPerfil } from '../types';

interface AuthState {
  carregando: boolean;
  usuario: User | null;
  perfil: UsuarioPerfil | null;
  empresa: Empresa | null;
  login: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string, nomeEmpresa: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const DEMO_PERFIL: UsuarioPerfil = {
  uid: 'demo-uid',
  nome: 'Josy Campos',
  email: 'demo@fluxa.app',
  empresaId: 'demo-empresa',
  papel: 'admin',
  criadoEm: new Date().toISOString(),
};

const DEMO_EMPRESA: Empresa = {
  id: 'demo-empresa',
  nome: 'Divinissima Semijoias',
  criadoEm: new Date().toISOString(),
  plano: 'trial',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Modo demonstração: sem projeto Firebase configurado ainda,
      // simula um usuário logado para dar pra navegar e testar as telas.
      setPerfil(DEMO_PERFIL);
      setEmpresa(DEMO_EMPRESA);
      setCarregando(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUsuario(u);
      if (u) {
        const perfilSnap = await getDoc(doc(db, 'usuarios', u.uid));
        if (perfilSnap.exists()) {
          const p = perfilSnap.data() as UsuarioPerfil;
          setPerfil(p);
          const empresaSnap = await getDoc(doc(db, 'companies', p.empresaId));
          if (empresaSnap.exists()) {
            setEmpresa({ id: empresaSnap.id, ...empresaSnap.data() } as Empresa);
          }
        }
      } else {
        setPerfil(null);
        setEmpresa(null);
      }
      setCarregando(false);
    });
    return unsub;
  }, []);

  async function login(email: string, senha: string) {
    await signInWithEmailAndPassword(auth, email, senha);
  }

  async function cadastrar(nome: string, email: string, senha: string, nomeEmpresa: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    const empresaRef = doc(db, 'companies', cred.user.uid); // 1ª empresa = doc com id do próprio admin fundador
    const novaEmpresa: Empresa = {
      id: empresaRef.id,
      nome: nomeEmpresa,
      criadoEm: new Date().toISOString(),
      plano: 'trial',
    };
    await setDoc(empresaRef, novaEmpresa);

    const novoPerfil: UsuarioPerfil = {
      uid: cred.user.uid,
      nome,
      email,
      empresaId: empresaRef.id,
      papel: 'admin',
      criadoEm: new Date().toISOString(),
    };
    await setDoc(doc(db, 'usuarios', cred.user.uid), novoPerfil);
  }

  async function sair() {
    if (isFirebaseConfigured) await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ carregando, usuario, perfil, empresa, login, cadastrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
