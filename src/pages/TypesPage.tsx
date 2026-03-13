import { EntityPage } from "../components/EntityPage";
import type { TypeEntity } from "../types";

interface TypeFormValues {
  name: string;
  description: string;
}

const emptyValues: TypeFormValues = {
  name: "",
  description: "",
};

export function TypesPage() {
  return (
    <EntityPage<TypeEntity, TypeFormValues>
      eyebrow="Modulo tipo"
      title="Tipos"
      description="Administra los tipos base de contenido como Pelicula y Serie usando `/types`."
      endpoint="/types"
      singularLabel="tipo"
      emptyValues={emptyValues}
      fields={[
        { name: "name", label: "Nombre", input: "text", required: true, placeholder: "Pelicula o Serie" },
        { name: "description", label: "Descripcion", input: "textarea", placeholder: "Describe el tipo de contenido." },
      ]}
      columns={[
        { key: "name", label: "Tipo", render: (item) => <strong>{item.name}</strong> },
        {
          key: "description",
          label: "Descripcion",
          render: (item) => item.description || <span className="muted-text">Sin descripcion</span>,
        },
      ]}
      mapItemToForm={(item) => ({
        name: item.name,
        description: item.description ?? "",
      })}
      buildPayload={(form) => ({
        name: form.name.trim(),
        description: form.description.trim() || null,
      })}
    />
  );
}
