import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import fluxaIcon from '../assets/fluxa-icon.svg';
import { useAuth } from '../contexts/AuthContext';

interface ItemLink {
  tipo: 'link';
  to: string;
  label: string;
  icon: string;
}

interface ItemSubmenu {
  tipo: 'submenu';
  label: string;
  icon: string;
  itens: ItemLink[];
}

type EntradaMenu = ItemLink | ItemSubmenu;

interface GrupoMenu {
  id: string;
  label: string;
  icon: string;
  itens: EntradaMenu[];
}

// Tudo que é cadastro fica junto num único menu "Cadastro" — itens com
// sub-opções (como Configurações contábeis) abrem um segundo nível ao lado,
// no mesmo padrão de "Produto" com submenu do seu sistema atual.
const grupos: GrupoMenu[] = [
  {
    id: 'cadastro',
    label: 'Cadastro',
    icon: '📇',
    itens: [
      { tipo: 'link', to: '/cadastros/clientes', label: 'Clientes', icon: '👤' },
      { tipo: 'link', to: '/cadastros/fornecedores', label: 'Fornecedores', icon: '🚚' },
      { tipo: 'link', to: '/cadastros/funcionarios', label: 'Funcionários', icon: '🧑‍💼' },
      { tipo: 'link', to: '/cadastros/vendedores', label: 'Vendedores', icon: '🏷️' },
      {
        tipo: 'submenu',
        label: 'Configurações contábeis',
        icon: '⚙️',
        itens: [
          { tipo: 'link', to: '/cadastros/departamentos', label: 'Departamentos', icon: '🏢' },
          { tipo: 'link', to: '/cadastros/cargos', label: 'Cargos', icon: '🪪' },
        ],
      },
    ],
  },
];

const emBreve = ['Financeiro', 'Estoque', 'Compras', 'Nota Fiscal'];

function linksDoGrupo(itens: EntradaMenu[]): ItemLink[] {
  return itens.flatMap((entrada) => (entrada.tipo === 'link' ? [entrada] : entrada.itens));
}

export default function Layout() {
  const { perfil, empresa, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [submenuAberto, setSubmenuAberto] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Fecha os menus abertos ao trocar de página.
  useEffect(() => {
    setMenuAberto(null);
    setSubmenuAberto(null);
  }, [location.pathname]);

  // Fecha os menus abertos ao clicar fora da barra de navegação.
  useEffect(() => {
    function aoClicarFora(evento: MouseEvent) {
      if (navRef.current && !navRef.current.contains(evento.target as Node)) {
        setMenuAberto(null);
        setSubmenuAberto(null);
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  function alternarMenu(id: string) {
    setMenuAberto((atual) => (atual === id ? null : id));
    setSubmenuAberto(null);
  }

  const classeItemDropdown = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-4 py-2 text-sm font-semibold transition-colors ${
      isActive ? 'text-teal-500 bg-teal-500/5' : 'text-ink hover:bg-surface'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-40 bg-white border-b border-line shrink-0">
        <div className="flex items-center gap-1 px-5 h-14">
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <img src={fluxaIcon} alt="Fluxa" className="w-8 h-8" />
            <span className="text-lg font-extrabold tracking-tight text-ink">Fluxa</span>
          </div>

          <nav ref={navRef} className="flex items-center gap-1 h-full">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? 'bg-teal-500/10 text-teal-500' : 'text-ink-soft hover:bg-surface'
                }`
              }
            >
              <span className="text-base">📊</span> Dashboard
            </NavLink>

            {grupos.map((grupo) => {
              const ativo = linksDoGrupo(grupo.itens).some((item) => location.pathname.startsWith(item.to));
              return (
                <div
                  key={grupo.id}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setMenuAberto(grupo.id)}
                  onMouseLeave={() => {
                    setMenuAberto(null);
                    setSubmenuAberto(null);
                  }}
                >
                  <button
                    type="button"
                    onClick={() => alternarMenu(grupo.id)}
                    className={`flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      ativo || menuAberto === grupo.id ? 'bg-teal-500/10 text-teal-500' : 'text-ink-soft hover:bg-surface'
                    }`}
                  >
                    <span className="text-base">{grupo.icon}</span> {grupo.label}
                    <span className="text-[9px] opacity-60">▾</span>
                  </button>

                  {menuAberto === grupo.id && (
                    <div className="absolute top-full left-0 pt-1 min-w-[230px] z-50">
                      <div className="bg-white border border-line rounded-xl shadow-xl py-1.5">
                        {grupo.itens.map((entrada) => {
                          if (entrada.tipo === 'submenu') {
                            const idSubmenu = `${grupo.id}:${entrada.label}`;
                            return (
                              <div
                                key={entrada.label}
                                className="relative"
                                onMouseEnter={() => setSubmenuAberto(idSubmenu)}
                                onMouseLeave={() => setSubmenuAberto(null)}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSubmenuAberto((atual) => (atual === idSubmenu ? null : idSubmenu))
                                  }
                                  className="w-full flex items-center justify-between gap-2.5 px-4 py-2 text-sm font-semibold text-ink hover:bg-surface transition-colors"
                                >
                                  <span className="flex items-center gap-2.5">
                                    <span className="text-base">{entrada.icon}</span> {entrada.label}
                                  </span>
                                  <span className="text-[9px] opacity-60">▸</span>
                                </button>

                                {submenuAberto === idSubmenu && (
                                  <div className="absolute top-0 left-full pl-1 min-w-[200px] z-50">
                                    <div className="bg-white border border-line rounded-xl shadow-xl py-1.5">
                                      {entrada.itens.map((item) => (
                                        <NavLink key={item.to} to={item.to} className={classeItemDropdown}>
                                          <span className="text-base">{item.icon}</span> {item.label}
                                        </NavLink>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <NavLink key={entrada.to} to={entrada.to} className={classeItemDropdown}>
                              <span className="text-base">{entrada.icon}</span> {entrada.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setMenuAberto('em-breve')}
              onMouseLeave={() => setMenuAberto(null)}
            >
              <button
                type="button"
                onClick={() => alternarMenu('em-breve')}
                className="flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-semibold text-ink-soft/50"
              >
                <span className="text-base">🔒</span> Em breve
                <span className="text-[9px] opacity-60">▾</span>
              </button>
              {menuAberto === 'em-breve' && (
                <div className="absolute top-full left-0 pt-1 min-w-[190px] z-50">
                  <div className="bg-white border border-line rounded-xl shadow-xl py-1.5">
                    {emBreve.map((label) => (
                      <div
                        key={label}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-ink-soft/40 cursor-not-allowed"
                      >
                        <span className="text-base">🔒</span> {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-4 pl-4 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-ink-soft uppercase tracking-wide truncate max-w-[160px]">
                {empresa?.nome ?? '—'}
              </div>
              <div className="text-xs text-ink-soft truncate max-w-[160px]">{perfil?.nome}</div>
            </div>
            <button
              onClick={() => sair()}
              className="text-xs font-bold text-ink-soft hover:text-ink transition-colors border border-line rounded-lg px-3 py-1.5 shrink-0"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
