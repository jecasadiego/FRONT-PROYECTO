import { EntityPage } from "../components/EntityPage";
import type { Director } from "../types";

interface DirectorFormValues {
  names: string;
  isActive: boolean;
}

const emptyValues: DirectorFormValues = {
  names: "",
  isActive: true,
};

export function DirectorsPage() {
  return (
    <EntityPage<Director, DirectorFormValues>
      eyebrow="Modulo director"
      title="Directores"
      description="Administra el catalogo de directores principales usando la API `/directors`."
      endpoint="/directors"
      singularLabel="director"
      emptyValues={emptyValues}
      supportActiveFilter
      fields={[
        { name: "names", label: "Nombre completo", input: "text", required: true, placeholder: "Christopher Nolan" },
        { name: "isActive", label: "Disponible para nuevas medias", input: "checkbox" },
      ]}
      columns={[
        { key: "names", label: "Director", render: (item) => <strong>{item.names}</strong> },
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
        names: item.names,
        isActive: item.isActive,
      })}
      buildPayload={(form) => ({
        names: form.names.trim(),
        isActive: form.isActive,
      })}
    />
  );
}
