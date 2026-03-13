import { EntityPage } from "../components/EntityPage";
import type { Producer } from "../types";

interface ProducerFormValues {
  name: string;
  isActive: boolean;
  slogan: string;
  description: string;
}

const emptyValues: ProducerFormValues = {
  name: "",
  isActive: true,
  slogan: "",
  description: "",
};

export function ProducersPage() {
  return (
    <EntityPage<Producer, ProducerFormValues>
      eyebrow="Modulo productora"
      title="Productoras"
      description="Gestiona empresas productoras, su slogan y descripcion mediante `/producers`."
      endpoint="/producers"
      singularLabel="productora"
      emptyValues={emptyValues}
      supportActiveFilter
      fields={[
        { name: "name", label: "Nombre", input: "text", required: true, placeholder: "Syncopy" },
        { name: "slogan", label: "Slogan", input: "text", placeholder: "Cinema with ideas" },
        { name: "description", label: "Descripcion", input: "textarea", placeholder: "Breve descripcion de la productora." },
        { name: "isActive", label: "Disponible para nuevas medias", input: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Productora", render: (item) => <strong>{item.name}</strong> },
        {
          key: "slogan",
          label: "Slogan",
          render: (item) => item.slogan || <span className="muted-text">Sin slogan</span>,
        },
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
        slogan: item.slogan ?? "",
        description: item.description ?? "",
      })}
      buildPayload={(form) => ({
        name: form.name.trim(),
        isActive: form.isActive,
        slogan: form.slogan.trim() || null,
        description: form.description.trim() || null,
      })}
    />
  );
}
