import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '../components/molecules/GenericForm';
import { useDetalles } from '../hooks/useDetalles';
import { useMaterial } from '../hooks/useMaterial';
import { useSolicitud } from '../hooks/useSolicitud';
import { usePersona } from '../hooks/usePersona';
import { Detalles } from '../types/detalles.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2,  Package } from 'lucide-react';

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const DetallesPage: React.FC = () => {
  const {
    detalles,
    loading,
    error,
    createDetalle,
    updateDetalle,
    deleteDetalle
  } = useDetalles();

  const { materiales } = useMaterial();
  const { solicitudes } = useSolicitud();
  const { personas } = usePersona();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDetalle, setEditingDetalle] = useState<Detalles | null>(null);

  const columns: Column<Detalles>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      accessorKey: 'material',
      header: 'Material',
      sortable: true,
      cell: (row: Detalles) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.material?.nombre || 'Sin material'}</span>
        </div>
      )
    },
    {
      accessorKey: 'cantidad',
      header: 'Cantidad',
      sortable: true,
      cell: (row: Detalles) => (
        <span className="font-semibold text-blue-600">
          {row.cantidad}
        </span>
      )
    },
    {
      accessorKey: 'solicitud',
      header: 'Solicitud',
      sortable: true,
      cell: (row: Detalles) => (
        <span className="text-sm text-gray-600">
          {row.solicitud?.descripcion || 'Sin solicitud'}
        </span>
      )
    },
    {
      accessorKey: 'personaSolicita',
      header: 'Solicitante',
      sortable: true,
      cell: (row: Detalles) => (
        <span className="text-sm text-gray-600">
          {row.personaSolicita ? `${row.personaSolicita.nombre} ${row.personaSolicita.apellido || ''}` : 'Sin asignar'}
        </span>
      )
    },
    {
      accessorKey: 'personaAprueba',
      header: 'Aprobador',
      sortable: true,
      cell: (row: Detalles) => (
        <span className="text-sm text-gray-600">
          {row.personaAprueba ? `${row.personaAprueba.nombre} ${row.personaAprueba.apellido || ''}` : 'Sin asignar'}
        </span>
      )
    },
    {
      accessorKey: 'personaEncargada',
      header: 'Encargado',
      sortable: true,
      cell: (row: Detalles) => (
        <span className="text-sm text-gray-600">
          {row.personaEncargada ? `${row.personaEncargada.nombre} ${row.personaEncargada.apellido || ''}` : 'Sin asignar'}
        </span>
      )
    },
    {
      accessorKey: 'fechaCreacion',
      header: 'Fecha Creación',
      sortable: true,
      isDate: true,
      width: '150px'
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Fecha Actualización',
      sortable: true,
      isDate: true,
      width: '150px'
    }
  ];

  const formFields: FieldDefinition<Detalles>[] = [
    {
      name: 'materialId',
      label: 'Material',
      type: 'select',
      required: true,
      options: materiales.map(material => ({
        value: material.id,
        label: material.nombre
      }))
    },
    {
      name: 'cantidad',
      label: 'Cantidad',
      type: 'number',
      required: true
    },
    {
      name: 'solicitudId',
      label: 'Solicitud',
      type: 'select',
      options: solicitudes.map(solicitud => ({
        value: solicitud.id,
        label: solicitud.descripcion
      }))
    },
    {
      name: 'personaSolicitaId',
      label: 'Persona que Solicita',
      type: 'select',
      options: personas.map(persona => ({
        value: persona.id,
        label: `${persona.nombre} ${persona.apellido || ''}`
      }))
    },
    {
      name: 'personaApruebaId',
      label: 'Persona que Aprueba',
      type: 'select',
      options: personas.map(persona => ({
        value: persona.id,
        label: `${persona.nombre} ${persona.apellido || ''}`
      }))
    },
    {
      name: 'personaEncargadaId',
      label: 'Persona Encargada',
      type: 'select',
      options: personas.map(persona => ({
        value: persona.id,
        label: `${persona.nombre} ${persona.apellido || ''}`
      }))
    }
  ];

  const handleCreate = () => {
    setEditingDetalle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (detalle: Detalles) => {
    setEditingDetalle(detalle);
    setIsFormOpen(true);
  };

  const handleDelete = async (detalle: Detalles) => {
    try {
      await deleteDetalle(detalle.id);
      addToast({
        title: 'Detalle eliminado',
        description: `El detalle ha sido eliminado exitosamente.`,
        color: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error al eliminar',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  const handleSubmit = async (data: Partial<Detalles>) => {
    try {
      if (editingDetalle) {
        await updateDetalle(editingDetalle.id, data);
        addToast({
          title: 'Detalle actualizado',
          description: `El detalle ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        await createDetalle(data);
        addToast({
          title: 'Detalle creado',
          description: `El detalle ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingDetalle(null);
    } catch (error) {
      addToast({
        title: editingDetalle ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingDetalle(null);
  };

  const actions = [
    {
      icon: <Edit className="h-4 w-4" />,
      label: 'Editar',
      onClick: handleEdit,
      color: 'primary' as const
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: 'Eliminar',
      onClick: handleDelete,
      color: 'danger' as const
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Cargando detalles...</div>
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
            Gestión de Detalles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los detalles de las solicitudes de material del sistema
          </p>
        </div>
      </div>

      <DataTable
        data={detalles}
        columns={columns}
        actions={actions}
        onCreate={handleCreate}
        getRowId={(detalle) => detalle.id}
        title="Lista de Detalles"
        searchPlaceholder="Buscar detalles..."
        emptyMessage="No se encontraron detalles"
        createButtonLabel="Nuevo Detalle"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingDetalle || { cantidad: 0 }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default DetallesPage;