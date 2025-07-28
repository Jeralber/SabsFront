import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm } from '../components/molecules/GenericForm';
import { useMunicipio } from '../hooks/useMunicipio';
import { Municipio } from '../types/municipio.types';
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

const MunicipioPage: React.FC = () => {
  const {
    municipios,
    error,
    createMunicipio,
    updateMunicipio,
    deleteMunicipio
  } = useMunicipio();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMunicipio, setEditingMunicipio] = useState<Municipio | null>(null);

  // Definir las columnas de la tabla
  const columns: Column<Municipio>[] = [
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
      cell: (row: Municipio) => (
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
      cell: (row: Municipio) => (
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
      cell: (row: Municipio) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Municipio) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];

  // Definir los campos del formulario
  const formFields = [
    {
      name: 'nombre' as keyof Municipio,
      label: 'Nombre del Municipio',
      type: 'text' as const,
      required: true
    },
    {
      name: 'activo' as keyof Municipio,
      label: 'Estado Activo',
      type: 'checkbox' as const,
      required: false
    }
  ];

  // Manejar la creación de municipio
  const handleCreate = () => {
    setEditingMunicipio(null);
    setIsFormOpen(true);
  };

  // Manejar la edición de municipio
  const handleEdit = (municipio: Municipio) => {
    setEditingMunicipio(municipio);
    setIsFormOpen(true);
  };

  // Manejar la eliminación de municipio
  const handleDelete = async (id: number) => {
    const municipio = municipios.find(m => m.id === id);
    if (!municipio) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el municipio "${municipio.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteMunicipio(id);
        addToast({
          title: 'Municipio eliminado',
          description: `El municipio "${municipio.nombre}" ha sido eliminado exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar el municipio',
          color: 'danger'
        });
      }
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (data: Partial<Municipio>) => {
    try {
      if (editingMunicipio) {
        // Actualizar municipio existente
        await updateMunicipio(editingMunicipio.id, data);
        addToast({
          title: 'Municipio actualizado',
          description: `El municipio "${data.nombre}" ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        // Crear nuevo municipio
        await createMunicipio(data);
        addToast({
          title: 'Municipio creado',
          description: `El municipio "${data.nombre}" ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingMunicipio(null);
    } catch (error) {
      addToast({
        title: editingMunicipio ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  // Manejar cancelación del formulario
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingMunicipio(null);
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
      onClick: (municipio: Municipio) => handleDelete(municipio.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los municipios
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
            Gestión de Municipios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los municipios del sistema
          </p>
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={municipios}
        columns={columns}
        title="Municipios"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(municipio) => municipio.id}
        searchPlaceholder="Buscar municipios..."
        emptyMessage="No se encontraron municipios"
        createButtonLabel="Nuevo Municipio"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {/* Formulario modal */}
      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingMunicipio || { nombre: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default MunicipioPage;