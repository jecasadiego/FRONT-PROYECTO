import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { api, ApiError } from "../lib/api";
import { formatDateTime } from "../lib/format";
import type { ActivityFilter } from "../types";
import { PageHeader } from "./PageHeader";
import { StatusBanner } from "./StatusBanner";

type FormValue = string | boolean;

interface FieldConfig<TForm extends object> {
  name: keyof TForm;
  label: string;
  input: "text" | "textarea" | "checkbox";
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

interface TableColumn<TItem> {
  key: string;
  label: string;
  render: (item: TItem) => ReactNode;
}

interface StatusState {
  variant: "success" | "error" | "info";
  message: string;
  details?: string[];
}

interface EntityPageProps<
  TItem extends { id: number; updatedAt?: string; createdAt?: string },
  TForm extends object,
> {
  eyebrow: string;
  title: string;
  description: string;
  endpoint: string;
  singularLabel: string;
  emptyValues: TForm;
  fields: FieldConfig<TForm>[];
  columns: TableColumn<TItem>[];
  mapItemToForm: (item: TItem) => TForm;
  buildPayload?: (form: TForm) => Record<string, unknown>;
  supportActiveFilter?: boolean;
}

const activeFilterOptions: { value: ActivityFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

const getErrorPayload = (error: unknown): StatusState => {
  if (error instanceof ApiError) {
    return {
      variant: "error",
      message: error.message,
      details: error.details,
    };
  }

  return {
    variant: "error",
    message: "Ocurrio un error inesperado al comunicarse con la API",
  };
};

export function EntityPage<
  TItem extends { id: number; updatedAt?: string; createdAt?: string },
  TForm extends object,
>({
  eyebrow,
  title,
  description,
  endpoint,
  singularLabel,
  emptyValues,
  fields,
  columns,
  mapItemToForm,
  buildPayload,
  supportActiveFilter = false,
}: EntityPageProps<TItem, TForm>) {
  const [items, setItems] = useState<TItem[]>([]);
  const [formValues, setFormValues] = useState<TForm>(emptyValues);
  const [editingItem, setEditingItem] = useState<TItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [status, setStatus] = useState<StatusState | null>(null);

  const loadItems = async (withLoader = true) => {
    if (withLoader) {
      setLoading(true);
    }

    try {
      const query =
        supportActiveFilter && filter !== "all"
          ? { isActive: filter === "active" }
          : undefined;

      const data = await api.get<TItem[]>(endpoint, query);
      setItems(data);
    } catch (error) {
      setStatus(getErrorPayload(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems(true);
  }, [endpoint, filter, supportActiveFilter]);

  const resetForm = () => {
    setEditingItem(null);
    setFormValues(emptyValues);
  };

  const handleFieldChange = <TKey extends keyof TForm>(fieldName: TKey, value: TForm[TKey]) => {
    setFormValues((current) => ({
      ...current,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const payload = buildPayload ? buildPayload(formValues) : (formValues as Record<string, unknown>);

      if (editingItem) {
        await api.put<TItem>(`${endpoint}/${editingItem.id}`, payload);
        setStatus({
          variant: "success",
          message: `Se actualizo el ${singularLabel} correctamente.`,
        });
      } else {
        await api.post<TItem>(endpoint, payload);
        setStatus({
          variant: "success",
          message: `Se creo el ${singularLabel} correctamente.`,
        });
      }

      resetForm();
      await loadItems(false);
    } catch (error) {
      setStatus(getErrorPayload(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: TItem) => {
    setEditingItem(item);
    setFormValues(mapItemToForm(item));
    setStatus({
      variant: "info",
      message: `Estas editando el ${singularLabel} seleccionado.`,
    });
  };

  const handleDelete = async (item: TItem) => {
    const confirmed = window.confirm(`Vas a eliminar este ${singularLabel}. Esta accion no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`${endpoint}/${item.id}`);
      if (editingItem?.id === item.id) {
        resetForm();
      }
      setStatus({
        variant: "success",
        message: `Se elimino el ${singularLabel} correctamente.`,
      });
      await loadItems(false);
    } catch (error) {
      setStatus(getErrorPayload(error));
    }
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      {status ? (
        <StatusBanner variant={status.variant} message={status.message} details={status.details} />
      ) : null}

      <div className="page-grid">
        <section className="panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">{editingItem ? "Modo edicion" : "Nuevo registro"}</span>
              <h2>{editingItem ? `Editar ${singularLabel}` : `Crear ${singularLabel}`}</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            {fields.map((field) => {
              const value = formValues[field.name] as FormValue;
              const key = String(field.name);

              if (field.input === "checkbox") {
                return (
                  <label key={key} className="toggle-field">
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(event) =>
                        handleFieldChange(field.name, event.target.checked as TForm[typeof field.name])
                      }
                    />
                    <span>{field.label}</span>
                  </label>
                );
              }

              return (
                <label key={key} className="form-field">
                  <span>{field.label}</span>
                  {field.input === "textarea" ? (
                    <textarea
                      value={String(value)}
                      rows={field.rows ?? 4}
                      placeholder={field.placeholder}
                      required={field.required}
                      onChange={(event) =>
                        handleFieldChange(field.name, event.target.value as TForm[typeof field.name])
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      onChange={(event) =>
                        handleFieldChange(field.name, event.target.value as TForm[typeof field.name])
                      }
                    />
                  )}
                </label>
              );
            })}

            <div className="form-actions">
              <button className="button button--primary" type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : editingItem ? "Actualizar" : "Crear"}
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
              <span className="panel__eyebrow">Datos sincronizados</span>
              <h2>{title}</h2>
            </div>

            {supportActiveFilter ? (
              <div className="segmented-control" role="tablist" aria-label={`Filtro de ${title}`}>
                {activeFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      filter === option.value
                        ? "segmented-control__button segmented-control__button--active"
                        : "segmented-control__button"
                    }
                    onClick={() => setFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Cargando informacion desde la API...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <p>No hay registros para mostrar.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th>Actualizado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      {columns.map((column) => (
                        <td key={column.key}>{column.render(item)}</td>
                      ))}
                      <td>{formatDateTime(item.updatedAt ?? item.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <button className="button button--small button--secondary" type="button" onClick={() => handleEdit(item)}>
                            Editar
                          </button>
                          <button className="button button--small button--danger" type="button" onClick={() => handleDelete(item)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
