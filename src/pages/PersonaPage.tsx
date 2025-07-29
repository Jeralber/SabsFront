import { useState } from "react";
import { DataTable } from "@/components/molecules/DataTable";
import { GenericForm, FieldDefinition } from "@/components/molecules/GenericForm";
import { usePersona } from "@/hooks/usePersona";
import { useRol } from "@/hooks/useRol";
import { useFicha } from "@/hooks/useFicha";
import { Persona } from "@/types/persona.types";
import { Edit, Trash, User } from "lucide-react";

export default function PersonaPage() {
  const {
    personas,
    loading,
    error,
    createPersona,
    updatePersona,
    deletePersona,
  } = usePersona();
  
  const { roles } = useRol();
  const { fichas } = useFicha();
  
  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [isEditing, setIsEditing] = useState(false);


  const formFields: FieldDefinition<Persona>[] = [
    {
      name: "identificacion",
      label: "Identificación",
      type: "text",
      required: true,
    },
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
    },
    {
      name: "apellido",
      label: "Apellido",
      type: "text",
      required: true,
    },
    {
      name: "telefono",
      label: "Teléfono",
      type: "text",
    },
    {
      name: "correo",
      label: "Correo Electrónico",
      type: "email",
      required: true,
    },
    {
      name: "contrasena",
      label: "Contraseña",
      type: "password",
      required: !isEditing, 
    },
    {
      name: "edad",
      label: "Edad",
      type: "number",
      required: true,
    },
    {
      name: "rolId",
      label: "Rol",
      type: "select",
      options: roles.map(rol => ({
        label: rol.nombre,
        value: rol.id,
      })),
    },
    {
      name: "fichaId",
      label: "Ficha",
      type: "select",
      options: fichas.map(ficha => ({
        label: `Ficha ${ficha.numero}`,
        value: ficha.id,
      })),
    },
    {
      name: "activo",
      label: "Activo",
      type: "checkbox",
    },
  ];

  const columns = [
    {
      accessorKey: "identificacion" as keyof Persona,
      header: "Identificación",
      sortable: true,
    },
    {
      accessorKey: "nombre" as keyof Persona,
      header: "Nombre",
      sortable: true,
    },
    {
      accessorKey: "apellido" as keyof Persona,
      header: "Apellido",
      sortable: true,
    },
    {
      accessorKey: "correo" as keyof Persona,
      header: "Correo",
      sortable: true,
    },
    {
      accessorKey: "telefono" as keyof Persona,
      header: "Teléfono",
    },
    {
      accessorKey: "edad" as keyof Persona,
      header: "Edad",
      sortable: true,
    },
    {
      accessorKey: "rol" as keyof Persona,
      header: "Rol",
      cell: (row: Persona) => row.rol?.nombre || "Sin rol",
    },
    {
      accessorKey: "ficha" as keyof Persona,
      header: "Ficha",
      cell: (row: Persona) => row.ficha ? `Ficha ${row.ficha.numero}` : "Sin ficha",
    },
    {
      accessorKey: "activo" as keyof Persona,
      header: "Estado",
      cell: (row: Persona) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.activo
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {row.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      accessorKey: "fechaCreacion" as keyof Persona,
      header: "Fecha Creación",
      isDate: true,
      cell: (row: Persona) => new Date(row.fechaCreacion).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: "Editar",
      icon: <Edit size={16} />,
      onClick: (row: Persona) => handleEdit(row),
      variant: "primary" as const,
    },
    {
      label: "Eliminar",
      icon: <Trash size={16} />,
      onClick: (row: Persona) => handleDelete(row.id),
      variant: "danger" as const,
      show: (row: Persona) => row.activo, 
    },
  ];

  const handleCreate = () => {
    setEditingPersona(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta persona?")) {
      try {
        await deletePersona(id);
        alert("Persona eliminada exitosamente");
      } catch (error) {
        alert("Error al eliminar la persona");
      }
    }
  };

  const handleFormSubmit = async (values: Partial<Persona>) => {
    try {
      if (isEditing && editingPersona) {
        await updatePersona(editingPersona.id, values);
        alert("Persona actualizada exitosamente");
      } else {
        await createPersona({
          ...values,
          activo: values.activo ?? true,
          fechaCreacion: new Date(),
        });
        alert("Persona creada exitosamente");
      }
      setShowForm(false);
      setEditingPersona(null);
      setIsEditing(false);
    } catch (error) {
      alert(`Error al ${isEditing ? "actualizar" : "crear"} la persona`);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPersona(null);
    setIsEditing(false);
  };

  const getInitialValues = (): Partial<Persona> => {
    if (isEditing && editingPersona) {
      return {
        identificacion: editingPersona.identificacion,
        nombre: editingPersona.nombre,
        apellido: editingPersona.apellido,
        telefono: editingPersona.telefono,
        correo: editingPersona.correo,
        edad: editingPersona.edad,
        rolId: editingPersona.rolId,
        fichaId: editingPersona.fichaId,
        activo: editingPersona.activo,
      };
    }
    return {
      activo: true,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Cargando personas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
     <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Personas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
      </div>

      <DataTable
        data={personas}
        columns={columns}
        actions={actions}
        onCreate={handleCreate}
        getRowId={(row) => row.id}
        title="Lista de Personas"
        searchPlaceholder="Buscar por nombre, apellido, correo..."
        emptyMessage="No se encontraron personas"
        createButtonLabel="Nueva Persona"
        className="mb-6"
      />

      {showForm && (
        <GenericForm
          fields={formFields}
          initialValues={getInitialValues()}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}