import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import { StatusBanner } from "../components/StatusBanner";
import { api, ApiError } from "../lib/api";
import { formatDateTime, truncateText } from "../lib/format";
import type { Director, Genre, MediaItem, Producer, TypeEntity } from "../types";

interface MediaFormValues {
  serial: string;
  title: string;
  synopsis: string;
  url: string;
  coverImage: string;
  releaseYear: string;
  genreId: string;
  directorId: string;
  producerId: string;
  typeId: string;
}

interface MediaFilterValues {
  title: string;
  genreId: string;
  directorId: string;
  producerId: string;
  typeId: string;
  releaseYear: string;
}

interface CatalogState {
  genres: Genre[];
  directors: Director[];
  producers: Producer[];
  types: TypeEntity[];
}

interface StatusState {
  variant: "success" | "error" | "info";
  message: string;
  details?: string[];
}

const emptyForm: MediaFormValues = {
  serial: "",
  title: "",
  synopsis: "",
  url: "",
  coverImage: "",
  releaseYear: "",
  genreId: "",
  directorId: "",
  producerId: "",
  typeId: "",
};

const emptyFilters: MediaFilterValues = {
  title: "",
  genreId: "",
  directorId: "",
  producerId: "",
  typeId: "",
  releaseYear: "",
};

const getStatusFromError = (error: unknown): StatusState => {
  if (error instanceof ApiError) {
    return {
      variant: "error",
      message: error.message,
      details: error.details,
    };
  }

  return {
    variant: "error",
    message: "No fue posible completar la operacion con media.",
  };
};

const buildMediaPayload = (form: MediaFormValues) => ({
  serial: form.serial.trim(),
  title: form.title.trim(),
  synopsis: form.synopsis.trim(),
  url: form.url.trim(),
  coverImage: form.coverImage.trim(),
  releaseYear: Number(form.releaseYear),
  genreId: Number(form.genreId),
  directorId: Number(form.directorId),
  producerId: Number(form.producerId),
  typeId: Number(form.typeId),
});

const buildFilterQuery = (filters: MediaFilterValues) => ({
  title: filters.title.trim() || undefined,
  genreId: filters.genreId || undefined,
  directorId: filters.directorId || undefined,
  producerId: filters.producerId || undefined,
  typeId: filters.typeId || undefined,
  releaseYear: filters.releaseYear || undefined,
});

export function MediaPage() {
  const [catalogs, setCatalogs] = useState<CatalogState>({
    genres: [],
    directors: [],
    producers: [],
    types: [],
  });
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filters, setFilters] = useState<MediaFilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<MediaFilterValues>(emptyFilters);
  const [formValues, setFormValues] = useState<MediaFormValues>(emptyForm);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusState | null>(null);

  const loadCatalogs = async () => {
    setCatalogLoading(true);
    try {
      const [genres, directors, producers, types] = await Promise.all([
        api.get<Genre[]>("/genres"),
        api.get<Director[]>("/directors"),
        api.get<Producer[]>("/producers"),
        api.get<TypeEntity[]>("/types"),
      ]);

      setCatalogs({ genres, directors, producers, types });
    } catch (error) {
      setStatus(getStatusFromError(error));
    } finally {
      setCatalogLoading(false);
    }
  };

  const loadMedia = async (currentFilters: MediaFilterValues) => {
    setMediaLoading(true);
    try {
      const data = await api.get<MediaItem[]>("/media", buildFilterQuery(currentFilters));
      setMediaItems(data);
    } catch (error) {
      setStatus(getStatusFromError(error));
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalogs();
  }, []);

  useEffect(() => {
    void loadMedia(appliedFilters);
  }, [appliedFilters]);

  const resetForm = () => {
    setFormValues(emptyForm);
    setEditingItem(null);
  };

  const updateFormField = <TKey extends keyof MediaFormValues>(field: TKey, value: MediaFormValues[TKey]) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateFilterField = <TKey extends keyof MediaFilterValues>(
    field: TKey,
    value: MediaFilterValues[TKey],
  ) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const payload = buildMediaPayload(formValues);

      if (editingItem) {
        await api.put<MediaItem>(`/media/${editingItem.id}`, payload);
        setStatus({
          variant: "success",
          message: "La media fue actualizada correctamente.",
        });
      } else {
        await api.post<MediaItem>("/media", payload);
        setStatus({
          variant: "success",
          message: "La media fue creada correctamente.",
        });
      }

      resetForm();
      await loadMedia(appliedFilters);
    } catch (error) {
      setStatus(getStatusFromError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters({ ...filters });
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setFormValues({
      serial: item.serial,
      title: item.title,
      synopsis: item.synopsis,
      url: item.url,
      coverImage: item.coverImage,
      releaseYear: String(item.releaseYear),
      genreId: String(item.genreId),
      directorId: String(item.directorId),
      producerId: String(item.producerId),
      typeId: String(item.typeId),
    });
    setStatus({
      variant: "info",
      message: "Estas editando la media seleccionada.",
    });
  };

  const handleDelete = async (item: MediaItem) => {
    const confirmed = window.confirm(`Vas a eliminar "${item.title}". Esta accion no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/media/${item.id}`);
      if (editingItem?.id === item.id) {
        resetForm();
      }
      setStatus({
        variant: "success",
        message: "La media fue eliminada correctamente.",
      });
      await loadMedia(appliedFilters);
    } catch (error) {
      setStatus(getStatusFromError(error));
    }
  };

  const currentYear = new Date().getFullYear() + 1;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Modulo media"
        title="Peliculas y series"
        description="Registra, filtra, edita y elimina contenidos enlazando genero, director, productora y tipo desde la API `/media`."
      />

      {status ? (
        <StatusBanner variant={status.variant} message={status.message} details={status.details} />
      ) : null}

      <section className="panel">
        <div className="panel__header">
          <div>
            <span className="panel__eyebrow">Busqueda avanzada</span>
            <h2>Filtros de consulta</h2>
          </div>
        </div>

        <form className="filter-grid" onSubmit={handleApplyFilters}>
          <label className="form-field">
            <span>Titulo</span>
            <input
              type="text"
              value={filters.title}
              placeholder="Interstellar"
              onChange={(event) => updateFilterField("title", event.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Genero</span>
            <select value={filters.genreId} onChange={(event) => updateFilterField("genreId", event.target.value)}>
              <option value="">Todos</option>
              {catalogs.genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Director</span>
            <select value={filters.directorId} onChange={(event) => updateFilterField("directorId", event.target.value)}>
              <option value="">Todos</option>
              {catalogs.directors.map((director) => (
                <option key={director.id} value={director.id}>
                  {director.names}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Productora</span>
            <select value={filters.producerId} onChange={(event) => updateFilterField("producerId", event.target.value)}>
              <option value="">Todas</option>
              {catalogs.producers.map((producer) => (
                <option key={producer.id} value={producer.id}>
                  {producer.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Tipo</span>
            <select value={filters.typeId} onChange={(event) => updateFilterField("typeId", event.target.value)}>
              <option value="">Todos</option>
              {catalogs.types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Año de estreno</span>
            <input
              type="number"
              min="1888"
              max={currentYear}
              value={filters.releaseYear}
              placeholder="2024"
              onChange={(event) => updateFilterField("releaseYear", event.target.value)}
            />
          </label>

          <div className="form-actions">
            <button className="button button--primary" type="submit">
              Aplicar filtros
            </button>
            <button className="button button--ghost" type="button" onClick={handleClearFilters}>
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <div className="page-grid page-grid--media">
        <section className="panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">{editingItem ? "Modo edicion" : "Nuevo contenido"}</span>
              <h2>{editingItem ? `Editar: ${editingItem.title}` : "Registrar pelicula o serie"}</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Serial</span>
              <input
                type="text"
                value={formValues.serial}
                required
                placeholder="MOV-INT-001"
                onChange={(event) => updateFormField("serial", event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Titulo</span>
              <input
                type="text"
                value={formValues.title}
                required
                placeholder="Interstellar"
                onChange={(event) => updateFormField("title", event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>URL del video</span>
              <input
                type="url"
                value={formValues.url}
                required
                placeholder="https://stream.example.com/interstellar"
                onChange={(event) => updateFormField("url", event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Imagen de portada</span>
              <input
                type="url"
                value={formValues.coverImage}
                required
                placeholder="https://img.example.com/interstellar.jpg"
                onChange={(event) => updateFormField("coverImage", event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Año de estreno</span>
              <input
                type="number"
                min="1888"
                max={currentYear}
                value={formValues.releaseYear}
                required
                placeholder="2014"
                onChange={(event) => updateFormField("releaseYear", event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Genero</span>
              <select
                value={formValues.genreId}
                required
                onChange={(event) => updateFormField("genreId", event.target.value)}
              >
                <option value="">Selecciona un genero</option>
                {catalogs.genres.map((genre) => (
                  <option key={genre.id} value={genre.id} disabled={!genre.isActive}>
                    {genre.name}
                    {!genre.isActive ? " (inactivo)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Director</span>
              <select
                value={formValues.directorId}
                required
                onChange={(event) => updateFormField("directorId", event.target.value)}
              >
                <option value="">Selecciona un director</option>
                {catalogs.directors.map((director) => (
                  <option key={director.id} value={director.id} disabled={!director.isActive}>
                    {director.names}
                    {!director.isActive ? " (inactivo)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Productora</span>
              <select
                value={formValues.producerId}
                required
                onChange={(event) => updateFormField("producerId", event.target.value)}
              >
                <option value="">Selecciona una productora</option>
                {catalogs.producers.map((producer) => (
                  <option key={producer.id} value={producer.id} disabled={!producer.isActive}>
                    {producer.name}
                    {!producer.isActive ? " (inactiva)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Tipo</span>
              <select
                value={formValues.typeId}
                required
                onChange={(event) => updateFormField("typeId", event.target.value)}
              >
                <option value="">Selecciona un tipo</option>
                {catalogs.types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field form-field--full">
              <span>Sinopsis</span>
              <textarea
                rows={5}
                value={formValues.synopsis}
                required
                placeholder="Resumen corto del contenido audiovisual."
                onChange={(event) => updateFormField("synopsis", event.target.value)}
              />
            </label>

            <div className="media-preview">
              <span className="panel__eyebrow">Previsualizacion</span>
              {formValues.coverImage.trim() ? (
                <img src={formValues.coverImage.trim()} alt={`Portada de ${formValues.title || "media"}`} />
              ) : (
                <div className="media-preview__placeholder">Agrega una URL de imagen para ver la portada.</div>
              )}
            </div>

            <div className="form-actions">
              <button className="button button--primary" type="submit" disabled={submitting || catalogLoading}>
                {submitting ? "Guardando..." : editingItem ? "Actualizar media" : "Crear media"}
              </button>
              <button className="button button--ghost" type="button" onClick={resetForm}>
                {editingItem ? "Cancelar" : "Limpiar"}
              </button>
            </div>
          </form>
        </section>

        <section className="panel panel--wide">
          <div className="panel__header panel__header--space">
            <div>
              <span className="panel__eyebrow">Resultados del catalogo</span>
              <h2>Media registrada</h2>
            </div>
            <span className="results-pill">{mediaItems.length} resultado(s)</span>
          </div>

          {catalogLoading || mediaLoading ? (
            <div className="empty-state">
              <p>Cargando catalogos y media desde la API...</p>
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="empty-state">
              <p>No hay peliculas o series que coincidan con los filtros actuales.</p>
            </div>
          ) : (
            <div className="media-grid">
              {mediaItems.map((item) => (
                <article key={item.id} className="media-card">
                  <div className="media-card__image">
                    <img src={item.coverImage} alt={item.title} loading="lazy" />
                    <span className="badge badge--dark">{item.type.name}</span>
                  </div>

                  <div className="media-card__body">
                    <div className="media-card__heading">
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.serial}</p>
                      </div>
                      <strong>{item.releaseYear}</strong>
                    </div>

                    <p className="media-card__synopsis">{truncateText(item.synopsis, 160)}</p>

                    <dl className="meta-list">
                      <div>
                        <dt>Genero</dt>
                        <dd>{item.genre.name}</dd>
                      </div>
                      <div>
                        <dt>Director</dt>
                        <dd>{item.director.names}</dd>
                      </div>
                      <div>
                        <dt>Productora</dt>
                        <dd>{item.producer.name}</dd>
                      </div>
                      <div>
                        <dt>Actualizado</dt>
                        <dd>{formatDateTime(item.updatedAt)}</dd>
                      </div>
                    </dl>

                    <div className="media-card__actions">
                      <a className="button button--secondary button--small" href={item.url} target="_blank" rel="noreferrer">
                        Abrir URL
                      </a>
                      <button className="button button--secondary button--small" type="button" onClick={() => handleEdit(item)}>
                        Editar
                      </button>
                      <button className="button button--danger button--small" type="button" onClick={() => handleDelete(item)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
