import React, { useState, useEffect } from "react";
import { DataTable } from "../components/molecules/DataTable";
import { GenericForm } from "../components/molecules/GenericForm";
import { useArea } from "../hooks/useArea";
import { Area } from "../types/area.types";
import { addToast } from "@heroui/react";
import { Edit, Trash2, MapPin, Settings, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const AreaPage: React.FC = () => {
  const navigate = useNavigate();
  const { areas, error, createArea, updateArea, deleteArea } = useArea();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);


  useEffect(() => {
  }, []);

  const columns: Column<Area>[] = [
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
      cell: (row: Area) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      ),
    },
  
    {
      accessorKey: "activo",
      header: "Estado",
      sortable: true,
      cell: (row: Area) => (
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
      cell: (row: Area) =>
        new Date(row.fechaCreacion).toLocaleDateString("es-ES"),
    },
    {
      accessorKey: "fechaActualizacion",
      header: "Última Actualización",
      sortable: true,
      isDate: true,
      cell: (row: Area) =>
        row.fechaActualizacion
          ? new Date(row.fechaActualizacion).toLocaleDateString("es-ES")
          : "N/A",
    },
  ];

  const formFields = [
    {
      name: "nombre" as keyof Area,
      label: "Nombre del Área",
      type: "text" as const,
      required: true,
    },
 
    {
      name: "activo" as keyof Area,
      label: "Estado Activo",
      type: "checkbox" as const,
      required: false,
    },
  ];


  const getInitialValues = () => {
    if (editingArea) {
      return {
        nombre: editingArea.nombre || '',
        activo: editingArea.activo ?? true
      };
    }
    return {
      nombre: '',
      tituladoId: undefined,
      areaCentroId: undefined,
      activo: true
    };
  };

  const handleSubmit = async (data: Partial<Area>) => {
    try {
      const processedData = {
        ...data,
      };

      if (editingArea) {
        await updateArea(editingArea.id, processedData);
        addToast({
          title: "Área actualizada",
          description: `El área "${data.nombre}" ha sido actualizada exitosamente.`,
          color: "success",
        });
      } else {
        await createArea(processedData);
        addToast({
          title: "Área creada",
          description: `El área "${data.nombre}" ha sido creada exitosamente.`,
          color: "success",
        });
      }
      setIsFormOpen(false);
      setEditingArea(null);
    } catch (error) {
      addToast({
        title: editingArea ? "Error al actualizar" : "Error al crear",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        color: "danger",
      });
    }
  };

  const handleCreate = () => {
    setEditingArea(null);
    setIsFormOpen(true);
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const area = areas.find((a) => a.id === id);
    if (!area) return;

    const result = await Swal.fire({
      title: '¿Eliminar Área?',
      text: `¿Está seguro de que desea eliminar el área "${area.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteArea(id);
        addToast({
          title: "Área eliminada",
          description: `El área "${area.nombre}" ha sido eliminada exitosamente.`,
          color: "success",
        });

        await Swal.fire({
          title: '¡Eliminada!',
          text: 'El área ha sido eliminada correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        addToast({
          title: "Error al eliminar",
          description:
            error instanceof Error
              ? error.message
              : "Error desconocido al eliminar el área",
          color: "danger",
        });

        await Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el área. Inténtelo nuevamente.',
          icon: 'error'
        });
      }
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingArea(null);
  };

  const actions = [
    {
      label: "Editar",
      icon: <Edit size={16} />,
      onClick: handleEdit,
      variant: "primary" as const,
    },
    {
      label: "Eliminar",
      icon: <Trash2 size={16} />,
      onClick: (area: Area) => handleDelete(area.id),
      variant: "danger" as const,
    },
  ];

  const handleNavigateToAreaCentro = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    navigate('/areacentros');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar las áreas
          </div>
          <div className="text-gray-600 dark:text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Áreas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las áreas del sistema
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Gestión de Área-Centro</h3>
            <p className="text-blue-100 mb-4">
              Administra las relaciones entre áreas y centros del sistema
            </p>
            <button
              onClick={handleNavigateToAreaCentro}
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
            >
              <Settings className="w-4 h-4 mr-2" />
              Gestionar Área-Centro
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          <div className="hidden md:block">
            <Settings className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      <DataTable
        data={areas}
        columns={columns}
        title="Áreas"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(area) => area.id}
        searchPlaceholder="Buscar áreas..."
        emptyMessage="No se encontraron áreas"
        createButtonLabel="Nueva Área"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={getInitialValues()}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default AreaPage;
