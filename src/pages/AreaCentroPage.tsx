import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm } from '../components/molecules/GenericForm';
import { useAreaCentro } from '../hooks/useAreaCentro';
import { useArea } from '../hooks/useArea';
import { useCentro } from '../hooks/useCentro';
import { AreaCentro } from '../types/area-centro.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Building, MapPin } from 'lucide-react';


type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const AreaCentroPage: React.FC = () => {
  const {
    areasCentro,
    error,
    createAreaCentro,
    updateAreaCentro,
    deleteAreaCentro
  } = useAreaCentro();

  const { areas } = useArea();
  const { centros } = useCentro();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAreaCentro, setEditingAreaCentro] = useState<AreaCentro | null>(null);

  const columns: Column<AreaCentro>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      accessorKey: 'centro',
      header: 'Centro',
      sortable: false,
      cell: (row: AreaCentro) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.centro?.nombre || 'Sin centro'}</span>
        </div>
      )
    },
    {
      accessorKey: 'area',
      header: 'Área',
      sortable: false,
      cell: (row: AreaCentro) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-500" />
          <span className="font-medium">{row.area?.nombre || 'Sin área'}</span>
        </div>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: AreaCentro) => (
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
      cell: (row: AreaCentro) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: AreaCentro) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];

  const formFields = [
    {
      name: 'centroId' as keyof AreaCentro,
      label: 'Centro',
      type: 'select' as const,
      required: true,
      options: centros.map(centro => ({
        value: centro.id,
        label: centro.nombre
      }))
    },
    {
      name: 'areaId' as keyof AreaCentro,
      label: 'Área',
      type: 'select' as const,
      required: true,
      options: areas.map(area => ({
        value: area.id,
        label: area.nombre
      }))
    },
    {
      name: 'activo' as keyof AreaCentro,
      label: 'Estado Activo',
      type: 'checkbox' as const,
      required: false
    }
  ];

  const handleCreate = () => {
    setEditingAreaCentro(null);
    setIsFormOpen(true);
  };

  const handleEdit = (areaCentro: AreaCentro) => {
    setEditingAreaCentro(areaCentro);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const areaCentro = areasCentro.find(ac => ac.id === id);
    if (!areaCentro) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar la relación entre "${areaCentro.centro?.nombre || 'Centro'}" y "${areaCentro.area?.nombre || 'Área'}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteAreaCentro(id);
        addToast({
          title: 'Relación eliminada',
          description: `La relación área-centro ha sido eliminada exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar la relación área-centro',
          color: 'danger'
        });
      }
    }
  };

  const handleSubmit = async (data: Partial<AreaCentro>) => {
    try {
      if (editingAreaCentro) {
        await updateAreaCentro(editingAreaCentro.id, data);
        addToast({
          title: 'Relación actualizada',
          description: `La relación área-centro ha sido actualizada exitosamente.`,
          color: 'success'
        });
      } else {
        await createAreaCentro(data);
        addToast({
          title: 'Relación creada',
          description: `La relación área-centro ha sido creada exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingAreaCentro(null);
    } catch (error) {
      addToast({
        title: editingAreaCentro ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingAreaCentro(null);
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
      onClick: (areaCentro: AreaCentro) => handleDelete(areaCentro.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar las relaciones área-centro
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
            Gestión de Áreas por Centro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las relaciones entre áreas y centros del sistema
          </p>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors" 
        > 
          Volver 
        </button>
      </div>
      

      <DataTable
        data={areasCentro}
        columns={columns}
        title="Áreas por Centro"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(areaCentro) => areaCentro.id}
        searchPlaceholder="Buscar relaciones área-centro..."
        emptyMessage="No se encontraron relaciones área-centro"
        createButtonLabel="Nueva Relación"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingAreaCentro || { centroId: 0, areaId: 0, activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default AreaCentroPage;