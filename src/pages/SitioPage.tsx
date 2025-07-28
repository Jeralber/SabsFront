import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, } from '../components/molecules/GenericForm';
import { useSitio } from '../hooks/useSitio';
import { useTipoSitio } from '../hooks/useTipoSitio';
import { Sitio } from '../types/sitio.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2,} from 'lucide-react';

// Importar el tipo Column del DataTable
type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const SitioPage: React.FC = () => {
  const {
    sitios,
    error,
    createSitio,
    updateSitio,
    deleteSitio
  } = useSitio();

  const { tiposSitio } = useTipoSitio();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSitio, setEditingSitio] = useState<Sitio | null>(null);

  // Definir las columnas de la tabla
  const columns: Column<Sitio>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      sortable: true
    },
    {
      accessorKey: 'tipoSitio',
      header: 'Tipo de Sitio',
      sortable: true,
      cell: (row: Sitio) => (
        <span className="text-sm text-gray-600">
          {row.tipoSitio?.nombre || 'Sin tipo'}
        </span>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Sitio) => (
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
      cell: (row: Sitio) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Sitio) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];

  // Definir los campos del formulario
  const formFields = [
    {
      name: 'nombre' as keyof Sitio,
      label: 'Nombre del Sitio',
      type: 'text' as const,
      required: true
    },
    {
      name: 'tipoSitioId' as keyof Sitio,
      label: 'Tipo de Sitio',
      type: 'select' as const,
      required: false,
      options: tiposSitio.map(tipo => ({
        label: tipo.nombre,
        value: tipo.id
      }))
    },
    {
      name: 'activo' as keyof Sitio,
      label: 'Estado Activo',
      type: 'checkbox' as const,
      required: false
    }
  ];

  // Función para crear un nuevo sitio
  const handleCreate = () => {
    setEditingSitio(null);
    setIsFormOpen(true);
  };

  // Función para editar un sitio
  const handleEdit = (sitio: Sitio) => {
    setEditingSitio(sitio);
    setIsFormOpen(true);
  };

  // Función para eliminar un sitio
  const handleDelete = async (id: number) => {
    const sitio = sitios.find(s => s.id === id);
    if (!sitio) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el sitio "${sitio.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteSitio(id);
        addToast({
          title: 'Sitio eliminado',
          description: `El sitio "${sitio.nombre}" ha sido eliminado exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar el sitio',
          color: 'danger'
        });
      }
    }
  };

  // Función para enviar el formulario
  const handleSubmit = async (data: Partial<Sitio>) => {
    try {
      if (editingSitio) {
        await updateSitio(editingSitio.id, data);
        addToast({
          title: 'Sitio actualizado',
          description: `El sitio "${data.nombre}" ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        await createSitio(data);
        addToast({
          title: 'Sitio creado',
          description: `El sitio "${data.nombre}" ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingSitio(null);
    } catch (error) {
      addToast({
        title: editingSitio ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  // Función para cancelar el formulario
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingSitio(null);
  };

  // Definir las acciones de la tabla
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
      onClick: (sitio: Sitio) => handleDelete(sitio.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los sitios
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
            Gestión de Sitios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los sitios del sistema
          </p>
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={sitios}
        columns={columns}
        title="Sitios"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(sitio) => sitio.id}
        searchPlaceholder="Buscar sitios..."
        emptyMessage="No se encontraron sitios"
        createButtonLabel="Nuevo Sitio"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {/* Formulario modal */}
      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingSitio || { nombre: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default SitioPage;