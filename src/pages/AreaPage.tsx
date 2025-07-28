import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm } from '../components/molecules/GenericForm';
import { useArea } from '../hooks/useArea';
import { Area } from '../types/area.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, MapPin } from 'lucide-react';

// Importar el tipo Column del DataTable
type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const AreaPage: React.FC = () => {
  const {
    areas,
    error,
    createArea,
    updateArea,
    deleteArea
  } = useArea();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  // Definir las columnas de la tabla
  const columns: Column<Area>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      sortable: true,
      cell: (row: Area) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Area) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.activo 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      accessorKey: 'fechaCreacion',
      header: 'Fecha Creación',
      sortable: true,
      isDate: true,
      cell: (row: Area) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Area) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];

  // Definir los campos del formulario
  const formFields = [
    {
      name: 'nombre' as keyof Area,
      label: 'Nombre del Área',
      type: 'text' as const,
      required: true
    },
    {
      name: 'activo' as keyof Area,
      label: 'Estado Activo',
      type: 'checkbox' as const,
      required: false
    }
  ];

  // Manejar la creación de área
  const handleCreate = () => {
    setEditingArea(null);
    setIsFormOpen(true);
  };

  // Manejar la edición de área
  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setIsFormOpen(true);
  };

  // Manejar la eliminación de área
  const handleDelete = async (id: number) => {
    const area = areas.find(a => a.id === id);
    if (!area) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el área "${area.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteArea(id);
        addToast({
          title: 'Área eliminada',
          description: `El área "${area.nombre}" ha sido eliminada exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar el área',
          color: 'danger'
        });
      }
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (data: Partial<Area>) => {
    try {
      if (editingArea) {
        // Actualizar área existente
        await updateArea(editingArea.id, data);
        addToast({
          title: 'Área actualizada',
          description: `El área "${data.nombre}" ha sido actualizada exitosamente.`,
          color: 'success'
        });
      } else {
        // Crear nueva área
        await createArea(data);
        addToast({
          title: 'Área creada',
          description: `El área "${data.nombre}" ha sido creada exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingArea(null);
    } catch (error) {
      addToast({
        title: editingArea ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  // Manejar cancelación del formulario
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingArea(null);
  };

  // Acciones de la tabla
  const actions = [
    {
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: handleEdit,
      variant: 'primary' as const
    },
    {
      label: 'Eliminar',
      icon: <Trash2 size={16} />,
      onClick: (area: Area) => handleDelete(area.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar las áreas
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Tabla de datos */}
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

      {/* Formulario modal */}
      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingArea || { nombre: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default AreaPage;