import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '../components/molecules/GenericForm';
import { useTipoSitio } from '../hooks/useTipoSitio';
import { TipoSitio } from '../types/tipo-sitio.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const TipoSitioPage: React.FC = () => {
  const {
    tiposSitio,
    error,
    createTipoSitio,
    updateTipoSitio,
    deleteTipoSitio
  } = useTipoSitio();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTipoSitio, setEditingTipoSitio] = useState<TipoSitio | null>(null);
  const navigate = useNavigate();

  const columns: Column<TipoSitio>[] = [
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
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: TipoSitio) => (
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
      cell: (row: TipoSitio) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: TipoSitio) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];

  const formFields: FieldDefinition<TipoSitio>[] = [
    {
      name: 'nombre',
      label: 'Nombre del Tipo de Sitio',
      type: 'text',
      required: true
    },
    {
      name: 'activo',
      label: 'Estado Activo',
      type: 'checkbox',
      required: false
    }
  ];

  const handleCreate = () => {
    setEditingTipoSitio(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tipoSitio: TipoSitio) => {
    setEditingTipoSitio(tipoSitio);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const tipoSitio = tiposSitio.find(t => t.id === id);
    if (!tipoSitio) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el tipo de sitio "${tipoSitio.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteTipoSitio(id);
        addToast({
          title: 'Tipo de sitio eliminado',
          description: `El tipo de sitio "${tipoSitio.nombre}" ha sido eliminado exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar el tipo de sitio',
          color: 'danger'
        });
      }
    }
  };

  const handleSubmit = async (data: Partial<TipoSitio>) => {
    try {
      if (editingTipoSitio) {
        await updateTipoSitio(editingTipoSitio.id, data);
        addToast({
          title: 'Tipo de sitio actualizado',
          description: `El tipo de sitio "${data.nombre}" ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        await createTipoSitio(data);
        addToast({
          title: 'Tipo de sitio creado',
          description: `El tipo de sitio "${data.nombre}" ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingTipoSitio(null);
    } catch (error) {
      addToast({
        title: editingTipoSitio ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingTipoSitio(null);
  };

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
      onClick: (tipoSitio: TipoSitio) => handleDelete(tipoSitio.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los tipos de sitio
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Tipos de Sitio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los tipos de sitio del sistema
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Volver
        </button>
      </div>

      <DataTable
        data={tiposSitio}
        columns={columns}
        title="Tipos de Sitio"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(tipoSitio) => tipoSitio.id}
        searchPlaceholder="Buscar tipos de sitio..."
        emptyMessage="No se encontraron tipos de sitio"
        createButtonLabel="Nuevo Tipo de Sitio"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingTipoSitio || { nombre: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default TipoSitioPage;