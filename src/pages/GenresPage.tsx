import { EntityPage } from "../components/EntityPage";
import type { Genre } from "../types";

interface GenreFormValues {
  name: string;
  isActive: boolean;
  description: string;
}

const emptyValues: GenreFormValues = {
  name: "",
  isActive: true,
  description: "",
};

export function GenresPage() {
  return (
    <EntityPage<Genre, GenreFormValues>
      eyebrow="Modulo genero"
      title="Generos"
      description="Crea, edita y elimina las categorias audiovisuales consumiendo `/genres`."
      endpoint="/genres"
      singularLabel="genero"
      emptyValues={emptyValues}
      supportActiveFilter
      fields={[
        { name: "name", label: "Nombre", input: "text", required: true, placeholder: "Accion, drama, suspenso..." },
        { name: "description", label: "Descripcion", input: "textarea", placeholder: "Describe el enfoque del genero." },
        { name: "isActive", label: "Disponible para nuevas medias", input: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Nombre", render: (item) => <strong>{item.name}</strong> },
        {
          key: "description",
          label: "Descripcion",
          render: (item) => item.description || <span className="muted-text">Sin descripcion</span>,
        },
        {
          key: "isActive",
          label: "Estado",
          render: (item) => (
            <span className={item.isActive ? "badge badge--success" : "badge badge--muted"}>
              {item.isActive ? "Activo" : "Inactivo"}
            </span>
          ),
        },
      ]}
      mapItemToForm={(item) => ({
        name: item.name,
        isActive: item.isActive,
        description: item.description ?? "",
      })}
      buildPayload={(form) => ({
        name: form.name.trim(),
        isActive: form.isActive,
        description: form.description.trim() || null,
      })}
    />
  );
}
