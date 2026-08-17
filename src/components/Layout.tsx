import { NavLink, Outlet } from 'react-router-dom';
import fluxaIcon from '../assets/fluxa-icon.svg';
import { useAuth } from '../contexts/AuthContext';

const cadastroLinks = [
  { to: '/cadastros/clientes', label: 'Clientes', icon: '👤' },
  { to: '/cadastros/fornecedores', label: 'Fornecedores', icon: '🚚' },
  { to: '/cadastros/funcionarios', label: 'Funcionários', icon: '🧑‍💼' },
  { to: '/cadastros/vendedores', label: 'Vendedores', icon: '🏷️' },
];

const contabilLinks = [
  { to: '/cadastros/departamentos', label: 'Departamentos', icon: '🏢' },
  { to: '/cadastros/cargos', label: 'Cargos', icon: '🪪' },
];

export default function Layout() {
  const { perfil, empresa, sair } = useAuth();

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="w-64 shrink-0 bg-white border-r border-line flex flex-col">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-line">
          <img src={fluxaIcon} alt="Fluxa" className="w-9 h-9" />
          <span className="text-xl font-extrabold tracking-tight text-ink">Fluxa</span>
        </div>

        <div className="px-5 py-4 border-b border-line">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Empresa</div>
          <div className="text-sm font-semibold text-ink mt-0.5 truncate">{empresa?.nome ?? '—'}</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive ? 'bg-teal-500/10 text-teal-500' : 'text-ink-soft hover:bg-surface'
              }`
            }
          >
            <span className="text-base">📊</span> Dashboard
          </NavLink>

          <div className="pt-4 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft/70">
            Cadastros
          </div>
          {cadastroLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-teal-500/10 text-teal-500' : 'text-ink-soft hover:bg-surface'
                }`
              }
            >
              <span className="text-base">{link.icon}</span> {link.label}
            </NavLink>
          ))}

          <div className="pt-4 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft/70">
            Contábil
          </div>
          {contabilLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-teal-500/10 text-teal-500' : 'text-ink-soft hover:bg-surface'
                }`
              }
            >
              <span className="text-base">{link.icon}</span> {link.label}
            </NavLink>
          ))}

          <div className="pt-4 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft/40">
            Em breve
          </div>
          {['Financeiro', 'Estoque', 'Compras', 'Nota Fiscal'].map((label) => (
            <div
              key={label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-ink-soft/40 cursor-not-allowed"
            >
              <span className="text-base">🔒</span> {label}
            </div>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-line">
          <div className="text-sm font-semibold text-ink truncate">{perfil?.nome}</div>
          <div className="text-xs text-ink-soft truncate mb-2">{perfil?.email}</div>
          <button
            onClick={() => sair()}
            className="text-xs font-bold text-ink-soft hover:text-ink transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
