import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/", label: "Inicio" },
  { to: "/genres", label: "Genero" },
  { to: "/directors", label: "Director" },
  { to: "/producers", label: "Productora" },
  { to: "/types", label: "Tipo" },
  { to: "/media", label: "Media" },
];

export function ShellLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div className="shell__sidebar-top">
          <div className="brand-card">
            <span className="brand-card__eyebrow">CineAtlas Studio</span>
            <h1>Panel editorial</h1>
            <p>Organiza fichas, categorias y contenido destacado para peliculas y series.</p>
          </div>

          <button
            type="button"
            className={isMobileMenuOpen ? "sidebar-menu-toggle sidebar-menu-toggle--open" : "sidebar-menu-toggle"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="admin-primary-nav"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            <span className="sidebar-menu-toggle__icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            Menu
          </button>
        </div>

        <nav
          id="admin-primary-nav"
          className={isMobileMenuOpen ? "sidebar-nav sidebar-nav--open" : "sidebar-nav"}
          aria-label="Navegacion principal"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                isActive ? "sidebar-nav__link sidebar-nav__link--active" : "sidebar-nav__link"
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={isMobileMenuOpen ? "sidebar-footer sidebar-footer--open" : "sidebar-footer"}>
          <span className="sidebar-meta__label">Vista publica</span>
          <Link className="button button--primary sidebar-footer__button" to="/catalogo" onClick={() => setIsMobileMenuOpen(false)}>
            Revisar pagina de peliculas
          </Link>
        </div>
      </aside>

      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  );
}
