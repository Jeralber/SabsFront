import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '../components/molecules/GenericForm';
import { useSede } from '../hooks/useSede';
import { useCentro } from '../hooks/useCentro';
import { Sede } from '../types/sede.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Building } from 'lucide-react';

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const SedePage: React.FC = () => {
  const {
    sedes,
    error,
    createSede,
    updateSede,
    deleteSede
  } = useSede();

  const { centros } = useCentro();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSede, setEditingSede] = useState<Sede | null>(null);

  const columns: Column<Sede>[] = [
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
      cell: (row: Sede) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      )
    },
    {
      accessorKey: 'direccion',
      header: 'Dirección',
      sortable: true,
      cell: (row: Sede) => (
        <span className="text-gray-600 dark:text-gray-400">{row.direccion}</span>
      )
    },
    {
      accessorKey: 'centro',
      header: 'Centro',
      sortable: false,
      cell: (row: Sede) => (
        <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
          {row.centro?.nombre || 'Sin centro'}
        </span>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Sede) => (
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
      cell: (row: Sede) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Sede) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];


  const formFields: FieldDefinition<Sede>[] = [
    {
      name: 'nombre',
      label: 'Nombre de la Sede',
      type: 'text',
      required: true
    },
    {
      name: 'direccion',
      label: 'Dirección',
      type: 'text',
      required: true
    },
    {
      name: 'centroId',
      label: 'Centro',
      type: 'select',
      required: false,
      options: centros.map(centro => ({
        label: centro.nombre,
        value: centro.id
      }))
    },
    {
      name: 'activo',
      label: 'Estado Activo',
      type: 'checkbox',
      required: false
    }
  ];


  const handleCreate = () => {
    setEditingSede(null);
    setIsFormOpen(true);
  };


  const handleEdit = (sede: Sede) => {
    setEditingSede(sede);
    setIsFormOpen(true);
  };


  const handleDelete = async (id: number) => {
    const sede = sedes.find(s => s.id === id);
    if (!sede) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar la sede "${sede.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteSede(id);
        addToast({
          title: 'Sede eliminada',
          description: `La sede "${sede.nombre}" ha sido eliminada exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar la sede',
          color: 'danger'
        });
      }
    }
  };

  const handleSubmit = async (data: Partial<Sede>) => {
    try {
      if (editingSede) {
        // Actualizar sede existente
        await updateSede(editingSede.id, data);
        addToast({
          title: 'Sede actualizada',
          description: `La sede "${data.nombre}" ha sido actualizada exitosamente.`,
          color: 'success'
        });
      } else {
        await createSede(data);
        addToast({
          title: 'Sede creada',
          description: `La sede "${data.nombre}" ha sido creada exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingSede(null);
    } catch (error) {
      addToast({
        title: editingSede ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };


  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingSede(null);
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
      onClick: (sede: Sede) => handleDelete(sede.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar las sedes
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
            Gestión de Sedes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las sedes del sistema
          </p>
        </div>
      </div>

      <DataTable
        data={sedes}
        columns={columns}
        title="Sedes"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(sede) => sede.id}
        searchPlaceholder="Buscar sedes..."
        emptyMessage="No se encontraron sedes"
        createButtonLabel="Nueva Sede"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm<Sede>
          fields={formFields}
          initialValues={editingSede || { nombre: '', direccion: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default SedePage;