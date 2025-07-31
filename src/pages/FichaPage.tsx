import { useState } from "react";
import { DataTable } from "@/components/molecules/DataTable";
import { GenericForm, FieldDefinition } from "@/components/molecules/GenericForm";
import { useFicha } from "@/hooks/useFicha";
import { Ficha } from "@/types/ficha.types";
import { Edit, Trash } from "lucide-react";
import { addToast } from "@heroui/react";

export default function FichaPage() {
  const {
    fichas,
    loading,
    error,
    createFicha,
    updateFicha,
    deleteFicha,
  } = useFicha();
  
  const [showForm, setShowForm] = useState(false);
  const [editingFicha, setEditingFicha] = useState<Ficha | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const formFields: FieldDefinition<Ficha>[] = [
    {
      name: "numero",
      label: "Número de Ficha",
      type: "number",
      required: true,
    },
    {
      name: "cantidadAprendices",
      label: "Cantidad de Aprendices",
      type: "number",
    },
    {
      name: "activo",
      label: "Activo",
      type: "checkbox",
    },
  ];

  // Definición de columnas para la tabla
  const columns = [
    {
      accessorKey: "numero" as keyof Ficha,
      header: "Número",
      sortable: true,
    },
    {
      accessorKey: "cantidadAprendices" as keyof Ficha,
      header: "Cantidad Aprendices",
      sortable: true,
      cell: (row: Ficha) => row.cantidadAprendices || "No especificado",
    },
    {
      accessorKey: "activo" as keyof Ficha,
      header: "Estado",
      cell: (row: Ficha) => (
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
      accessorKey: "fechaCreacion" as keyof Ficha,
      header: "Fecha Creación",
      isDate: true,
      cell: (row: Ficha) => new Date(row.fechaCreacion).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: "Editar",
      icon: <Edit size={16} />,
      onClick: (row: Ficha) => handleEdit(row),
      variant: "primary" as const,
    },
    {
      label: "Eliminar",
      icon: <Trash size={16} />,
      onClick: (row: Ficha) => handleDelete(row.id),
      variant: "danger" as const,
      show: (row: Ficha) => row.activo, 
    },
  ];

  const handleCreate = () => {
    setEditingFicha(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (ficha: Ficha) => {
    setEditingFicha(ficha);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta ficha?")) {
      try {
        await deleteFicha(id);
        addToast({
          title: "Ficha eliminada",
          description: "La ficha se ha eliminado exitosamente",
          color: "success",
        });
      } catch (error) {
        addToast({
          title: "Error al eliminar",
          description: "No se pudo eliminar la ficha",
          color: "danger",
        });
      }
    }
  };

  const handleFormSubmit = async (values: Partial<Ficha>) => {
    try {
      if (isEditing && editingFicha) {
        await updateFicha(editingFicha.id, values);
        addToast({
          title: "Ficha actualizada",
          description: "Los datos de la ficha se han actualizado correctamente",
          color: "success",
        });
      } else {
        await createFicha({
          ...values,
          activo: values.activo ?? true,
          fechaCreacion: new Date(),
        });
        addToast({
          title: "Ficha creada",
          description: "La nueva ficha se ha registrado exitosamente",
          color: "success",
        });
      }
      setShowForm(false);
      setEditingFicha(null);
      setIsEditing(false);
    } catch (error) {
      addToast({
        title: `Error al ${isEditing ? "actualizar" : "crear"} ficha`,
        description: "Ha ocurrido un error. Por favor, inténtelo nuevamente.",
        color: "danger",
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingFicha(null);
    setIsEditing(false);
  };

  const getInitialValues = (): Partial<Ficha> => {
    if (isEditing && editingFicha) {
      return {
        numero: editingFicha.numero,
        cantidadAprendices: editingFicha.cantidadAprendices,
        activo: editingFicha.activo,
      };
    }
    return {
      activo: true,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Cargando fichas...</div>
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
    <div className="container mx-auto ">
      <div className="flex items-center gap-3 mb-6">
       <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Fichas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las áreas del sistema
          </p>
      </div>
      </div>

      <DataTable
        data={fichas}
        columns={columns}
        actions={actions}
        onCreate={handleCreate}
        getRowId={(row) => row.id}
        title="Lista de Fichas"
        searchPlaceholder="Buscar por número de ficha..."
        emptyMessage="No se encontraron fichas"
        createButtonLabel="Nueva Ficha"
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