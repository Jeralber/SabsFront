import React, { useState } from "react";
import { DataTable } from "../components/molecules/DataTable";
import {
  GenericForm,
  FieldDefinition,
} from "../components/molecules/GenericForm";
import { useTipoMovimiento } from "../hooks/useTipoMovimiento";
import { TipoMovimiento } from "../types/tipo-movimiento.types";
import { addToast } from "@heroui/react";
import { Edit, Trash2, ArrowUpDown, Shield } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const TipoMovimientoPage: React.FC = () => {
  const { canAccess } = usePermissions();
  const {
    tiposMovimiento,
    loading,
    error,
    createTipoMovimiento,
    updateTipoMovimiento,
    deleteTipoMovimiento,
  } = useTipoMovimiento();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTipoMovimiento, setEditingTipoMovimiento] =
    useState<TipoMovimiento | null>(null);

  // Verificar si el usuario tiene permisos de administrador
  if (!canAccess('tipo-movimiento')) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Shield className="h-16 w-16 text-red-500" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Solo los administradores pueden acceder a la gestión de tipos de movimiento.
          </p>
        </div>
      </div>
    );
  }

  const columns: Column<TipoMovimiento>[] = [
    {
      accessorKey: "id",
      header: "ID",
      sortable: true,
      width: "80px",
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      sortable: true,
      cell: (row: TipoMovimiento) => (
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      ),
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      sortable: true,
      cell: (row: TipoMovimiento) => (
        <span className="text-sm text-gray-600">
          {row.descripcion || "Sin descripción"}
        </span>
      ),
    },
    {
      accessorKey: "activo",
      header: "Estado",
      sortable: true,
      cell: (row: TipoMovimiento) => (
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
      accessorKey: "fechaCreacion",
      header: "Fecha Creación",
      sortable: true,
      isDate: true,
      width: "150px",
    },
    {
      accessorKey: "fechaActualizacion",
      header: "Fecha Actualización",
      sortable: true,
      isDate: true,
      width: "150px",
    },
  ];

  const formFields: FieldDefinition<TipoMovimiento>[] = [
    {
      name: "nombre",
      label: "Nombre del Tipo",
      type: "text",
      required: true,
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "text",
    },
    {
      name: "activo",
      label: "Activo",
      type: "checkbox",
    },
  ];

  const handleCreate = () => {
    setEditingTipoMovimiento(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tipoMovimiento: TipoMovimiento) => {
    setEditingTipoMovimiento(tipoMovimiento);
    setIsFormOpen(true);
  };

  const handleDelete = async (tipoMovimiento: TipoMovimiento) => {
    try {
      await deleteTipoMovimiento(tipoMovimiento.id);
      addToast({
        title: "Tipo de movimiento eliminado",
        description: `El tipo "${tipoMovimiento.nombre}" ha sido eliminado exitosamente.`,
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Error al eliminar",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        color: "danger",
      });
    }
  };

  const handleSubmit = async (data: Partial<TipoMovimiento>) => {
    try {
      if (editingTipoMovimiento) {
        await updateTipoMovimiento(editingTipoMovimiento.id, data);
        addToast({
          title: "Tipo de movimiento actualizado",
          description: `El tipo "${data.nombre}" ha sido actualizado exitosamente.`,
          color: "success",
        });
      } else {
        await createTipoMovimiento(data);
        addToast({
          title: "Tipo de movimiento creado",
          description: `El tipo "${data.nombre}" ha sido creado exitosamente.`,
          color: "success",
        });
      }
      setIsFormOpen(false);
      setEditingTipoMovimiento(null);
    } catch (error) {
      addToast({
        title: editingTipoMovimiento ? "Error al actualizar" : "Error al crear",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        color: "danger",
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingTipoMovimiento(null);
  };

  const actions = [
    {
      icon: <Edit className="h-4 w-4" />,
      label: "Editar",
      onClick: handleEdit,
      color: "primary" as const,
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: "Eliminar",
      onClick: handleDelete,
      color: "danger" as const,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Cargando tipos de movimiento...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Tipos de Movimiento
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los tipos de movimiento del sistema (Solo Administradores)
          </p>
        </div>
      </div>

      <DataTable
        data={tiposMovimiento}
        columns={columns}
        actions={actions}
        onCreate={handleCreate}
        getRowId={(tipoMovimiento) => tipoMovimiento.id}
        title="Lista de Tipos de Movimiento"
        searchPlaceholder="Buscar tipos de movimiento..."
        emptyMessage="No se encontraron tipos de movimiento"
        createButtonLabel="Nuevo Tipo de Movimiento"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={
            editingTipoMovimiento || {
              nombre: "",
              descripcion: "",
              activo: true,
            }
          }
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default TipoMovimientoPage;
