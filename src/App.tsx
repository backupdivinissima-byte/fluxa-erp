import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Cadastrar from './pages/Cadastrar';
import Clientes from './pages/cadastros/Clientes';
import Fornecedores from './pages/cadastros/Fornecedores';
import Funcionarios from './pages/cadastros/Funcionarios';
import Vendedores from './pages/cadastros/Vendedores';
import Departamentos from './pages/cadastros/Departamentos';
import Cargos from './pages/cadastros/Cargos';

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { carregando, perfil } = useAuth();
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-soft text-sm">
        Carregando...
      </div>
    );
  }
  if (!perfil) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastrar" element={<Cadastrar />} />
      <Route
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/cadastros/clientes/*" element={<Clientes />} />
        <Route path="/cadastros/fornecedores/*" element={<Fornecedores />} />
        <Route path="/cadastros/funcionarios/*" element={<Funcionarios />} />
        <Route path="/cadastros/vendedores/*" element={<Vendedores />} />
        <Route path="/cadastros/departamentos/*" element={<Departamentos />} />
        <Route path="/cadastros/cargos/*" element={<Cargos />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}
