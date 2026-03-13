import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MediaPoster } from "../components/MediaPoster";
import { StatusBanner } from "../components/StatusBanner";
import { api, ApiError } from "../lib/api";
import { truncateText } from "../lib/format";
import type { Genre, MediaItem } from "../types";

type TypeFilter = "all" | "Pelicula" | "Serie";

const typeTabs: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "Pelicula", label: "Peliculas" },
  { value: "Serie", label: "Series" },
];

export function PublicCatalogPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedType, setSelectedType] = useState<TypeFilter>("all");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [media, genresData] = await Promise.all([
          api.get<MediaItem[]>("/media"),
          api.get<Genre[]>("/genres", { isActive: true }),
        ]);

        setMediaItems(media);
        setGenres(genresData);
      } catch (loadError) {
        if (loadError instanceof ApiError) {
          setError(loadError.message);
        } else {
          setError("No fue posible cargar la pagina publica.");
        }
      } finally {
        setLoading(false);
      }
    };

    void loadCatalog();
  }, []);

  const filteredItems = mediaItems.filter((item) => {
    const matchesType = selectedType === "all" ? true : item.type.name === selectedType;
    const matchesGenre = selectedGenre === null ? true : item.genre.id === selectedGenre;
    const matchesSearch = search.trim()
      ? `${item.title} ${item.genre.name} ${item.director.names}`.toLowerCase().includes(search.trim().toLowerCase())
      : true;

    return matchesType && matchesGenre && matchesSearch;
  });

  const featuredItem = filteredItems[0] ?? mediaItems[0] ?? null;

  const handleTypeChange = (value: TypeFilter) => {
    setSelectedType(value);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="catalog-page">
      <header className="catalog-topbar">
        <div className="catalog-brand">
          <div className="catalog-brand__mark" aria-hidden="true">
            <span className="catalog-brand__mark-strip" />
            <span className="catalog-brand__mark-play" />
          </div>
          <div>
            <strong>CineAtlas</strong>
            <span>Peliculas y series</span>
          </div>
        </div>

        <button
          type="button"
          className={isMobileMenuOpen ? "catalog-menu-toggle catalog-menu-toggle--open" : "catalog-menu-toggle"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="catalog-primary-nav"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          <span className="catalog-menu-toggle__icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          Menu
        </button>

        <nav
          id="catalog-primary-nav"
          className={
            isMobileMenuOpen
              ? "catalog-topbar__actions catalog-topbar__actions--open"
              : "catalog-topbar__actions"
          }
          aria-label="Navegacion principal"
        >
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={selectedType === tab.value ? "catalog-tab catalog-tab--active" : "catalog-tab"}
              onClick={() => handleTypeChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
          <Link className="button button--ghost catalog-admin-link" to="/" onClick={() => setIsMobileMenuOpen(false)}>
            Ir al panel
          </Link>
        </nav>
      </header>

      <main className="catalog-main">
        {error ? <StatusBanner variant="error" message={error} /> : null}

        <section className="catalog-hero">
          {featuredItem ? (
            <>
              <div className="catalog-hero__content">
                <span className="catalog-kicker">Destacado</span>
                <h1>{featuredItem.title}</h1>
                <p>{truncateText(featuredItem.synopsis, 240)}</p>

                <div className="catalog-hero__meta">
                  <span>{featuredItem.type.name}</span>
                  <span>{featuredItem.genre.name}</span>
                  <span>{featuredItem.releaseYear}</span>
                  <span>{featuredItem.director.names}</span>
                </div>

                <div className="catalog-hero__actions">
                  <button className="button button--primary" type="button" onClick={() => setSelectedItem(featuredItem)}>
                    Ver detalles
                  </button>
                </div>
              </div>

              <div className="catalog-hero__poster">
                <MediaPoster item={featuredItem} variant="hero" />
              </div>
            </>
          ) : (
            <div className="catalog-empty">
              <p>Agrega peliculas o series desde el panel para comenzar a poblar esta pagina.</p>
            </div>
          )}
        </section>

        <section className="catalog-toolbar">
          <div className="catalog-search">
            <label className="form-field">
              <span>Buscar por titulo, genero o director</span>
              <input
                type="text"
                value={search}
                placeholder="Busca una pelicula o serie"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="catalog-genres">
            <button
              type="button"
              className={selectedGenre === null ? "genre-pill genre-pill--active" : "genre-pill"}
              onClick={() => setSelectedGenre(null)}
            >
              Todo
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                className={selectedGenre === genre.id ? "genre-pill genre-pill--active" : "genre-pill"}
                onClick={() => setSelectedGenre(genre.id)}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </section>

        <section className="catalog-section">
          <div className="catalog-section__header">
            <div>
              <span className="catalog-kicker">Cartelera</span>
              <h2>Explora todos los titulos</h2>
            </div>
            <span className="results-pill">{filteredItems.length} titulo(s)</span>
          </div>

          {loading ? (
            <div className="catalog-empty">
              <p>Cargando catalogo...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="catalog-empty">
              <p>No hay resultados para los filtros actuales.</p>
            </div>
          ) : (
            <div className="catalog-grid">
              {filteredItems.map((item) => (
                <button key={item.id} type="button" className="catalog-tile" onClick={() => setSelectedItem(item)}>
                  <div className="catalog-tile__poster">
                    <MediaPoster item={item} variant="tile" />
                    <span className="catalog-tile__badge">{item.releaseYear}</span>
                  </div>
                  <div className="catalog-tile__overlay">
                    <span>{item.type.name}</span>
                    <strong>{item.title}</strong>
                    <p>{truncateText(item.synopsis, 86)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedItem ? (
        <div className="catalog-modal" role="dialog" aria-modal="true" onClick={() => setSelectedItem(null)}>
          <div className="catalog-modal__panel" onClick={(event) => event.stopPropagation()}>
            <div className="catalog-modal__poster">
              <MediaPoster item={selectedItem} variant="modal" />
            </div>

            <div className="catalog-modal__content">
              <div className="catalog-modal__header">
                <div>
                  <span className="catalog-kicker">{selectedItem.type.name}</span>
                  <h3>{selectedItem.title}</h3>
                </div>
                <button className="catalog-close" type="button" onClick={() => setSelectedItem(null)}>
                  Cerrar
                </button>
              </div>

              <p className="catalog-modal__synopsis">{selectedItem.synopsis}</p>

              <dl className="catalog-details">
                <div>
                  <dt>Genero</dt>
                  <dd>{selectedItem.genre.name}</dd>
                </div>
                <div>
                  <dt>Director</dt>
                  <dd>{selectedItem.director.names}</dd>
                </div>
                <div>
                  <dt>Productora</dt>
                  <dd>{selectedItem.producer.name}</dd>
                </div>
                <div>
                  <dt>Ano</dt>
                  <dd>{selectedItem.releaseYear}</dd>
                </div>
                <div>
                  <dt>Serial</dt>
                  <dd>{selectedItem.serial}</dd>
                </div>
              </dl>

              <div className="catalog-modal__actions">
                <a className="button button--primary" href={selectedItem.url} target="_blank" rel="noreferrer">
                  Abrir contenido
                </a>
                <button className="button button--ghost" type="button" onClick={() => setSelectedItem(null)}>
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
