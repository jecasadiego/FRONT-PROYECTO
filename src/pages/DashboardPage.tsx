import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { StatusBanner } from "../components/StatusBanner";
import { api, ApiError } from "../lib/api";
import type { Director, Genre, MediaItem, Producer, TypeEntity } from "../types";

interface DashboardState {
  genres: number;
  directors: number;
  producers: number;
  types: number;
  media: number;
}

const quickLinks = [
  { to: "/genres", label: "Gestionar generos" },
  { to: "/directors", label: "Gestionar directores" },
  { to: "/producers", label: "Gestionar productoras" },
  { to: "/types", label: "Gestionar tipos" },
  { to: "/media", label: "Gestionar media" },
];

export function DashboardPage() {
  const [state, setState] = useState<DashboardState>({
    genres: 0,
    directors: 0,
    producers: 0,
    types: 0,
    media: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [genres, directors, producers, types, media] = await Promise.all([
          api.get<Genre[]>("/genres"),
          api.get<Director[]>("/directors"),
          api.get<Producer[]>("/producers"),
          api.get<TypeEntity[]>("/types"),
          api.get<MediaItem[]>("/media"),
        ]);

        setState({
          genres: genres.length,
          directors: directors.length,
          producers: producers.length,
          types: types.length,
          media: media.length,
        });
      } catch (loadError) {
        if (loadError instanceof ApiError) {
          setError(loadError.message);
        } else {
          setError("No fue posible cargar el resumen del panel.");
        }
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Centro editorial"
        title="Administra tu catalogo audiovisual"
        description="Gestiona los datos base, organiza peliculas y series, y revisa en cualquier momento como se ve la pagina publica del catalogo."
      />

      {error ? <StatusBanner variant="error" message={error} /> : null}

      <section className="hero-card">
        <div>
          <span className="hero-card__eyebrow">Curaduria y gestion</span>
          <h2>{loading ? "Cargando resumen del catalogo..." : "Todo listo para editar y publicar."}</h2>
          <p>
            Mantiene actualizados los generos, directores, productoras, tipos y la cartelera general
            del sitio.
          </p>
        </div>

        <div className="hero-card__links">
          <Link className="button button--primary" to="/catalogo">
            Revisar pagina de peliculas
          </Link>
          {quickLinks.map((link) => (
            <Link key={link.to} className="button button--secondary" to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Generos</span>
          <strong>{loading ? "..." : state.genres}</strong>
        </article>
        <article className="stat-card">
          <span>Directores</span>
          <strong>{loading ? "..." : state.directors}</strong>
        </article>
        <article className="stat-card">
          <span>Productoras</span>
          <strong>{loading ? "..." : state.producers}</strong>
        </article>
        <article className="stat-card">
          <span>Tipos</span>
          <strong>{loading ? "..." : state.types}</strong>
        </article>
        <article className="stat-card">
          <span>Media</span>
          <strong>{loading ? "..." : state.media}</strong>
        </article>
      </section>
    </div>
  );
}
