import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '../components/molecules/GenericForm';
import { useSolicitud } from '../hooks/useSolicitud';
import { usePersona } from '../hooks/usePersona';
import { Solicitud } from '../types/solicitud.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, FileText, CheckCircle, XCircle, Package, RotateCcw } from 'lucide-react';

// Importar el tipo Column del DataTable
type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const SolicitudPage: React.FC = () => {
  const {
    solicitudes,
    loading,
    error,
    createSolicitud,
    updateSolicitud,
    deleteSolicitud,
    aprobarSolicitud,

  } = useSolicitud();

  const { personas } = usePersona();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSolicitud, setEditingSolicitud] = useState<Solicitud | null>(null);

  const columns: Column<Solicitud>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      sortable: true,
      cell: (row: Solicitud) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.descripcion}</span>
        </div>
      )
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      sortable: true,
      cell: (row: Solicitud) => {
        const getEstadoConfig = (estado: string) => {
          switch (estado) {
            case 'PENDIENTE':
              return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: <FileText className="h-3 w-3" /> };
            case 'APROBADA':
              return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: <CheckCircle className="h-3 w-3" /> };
            case 'RECHAZADA':
              return { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <XCircle className="h-3 w-3" /> };
            case 'ENTREGADA':
              return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: <Package className="h-3 w-3" /> };
            case 'DEVUELTA':
              return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: <RotateCcw className="h-3 w-3" /> };
            default:
              return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: <FileText className="h-3 w-3" /> };
          }
        };
        const config = getEstadoConfig(row.estado);
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}>
            {config.icon}
            {row.estado}
          </span>
        );
      }
    },
    {
      accessorKey: 'solicitante',
      header: 'Solicitante',
      sortable: true,
      cell: (row: Solicitud) => (
        <span className="text-sm text-gray-600">
          {row.solicitante?.nombre || 'Sin solicitante'} {row.solicitante?.apellido || ''}
        </span>
      )
    },
    {
      accessorKey: 'aprobador',
      header: 'Aprobador',
      sortable: true,
      cell: (row: Solicitud) => (
        <span className="text-sm text-gray-600">
          {row.aprobador ? `${row.aprobador.nombre} ${row.aprobador.apellido || ''}` : 'Sin asignar'}
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

  const formFields: FieldDefinition<Solicitud>[] = [
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'text',
      required: true
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { value: 'PENDIENTE', label: 'Pendiente' },
        { value: 'APROBADA', label: 'Aprobada' },
        { value: 'RECHAZADA', label: 'Rechazada' },
        { value: 'ENTREGADA', label: 'Entregada' },
        { value: 'DEVUELTA', label: 'Devuelta' }
      ]
    }
  ];

  const handleCreate = () => {
    setEditingSolicitud(null);
    setIsFormOpen(true);
  };


  const handleEdit = (solicitud: Solicitud) => {
    setEditingSolicitud(solicitud);
    setIsFormOpen(true);
  };


  const handleDelete = async (solicitud: Solicitud) => {
    try {
      await deleteSolicitud(solicitud.id);
      addToast({
        title: 'Solicitud eliminada',
        description: `La solicitud "${solicitud.descripcion}" ha sido eliminada exitosamente.`,
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

  const handleSubmit = async (data: Partial<Solicitud>) => {
    try {
      if (editingSolicitud) {
        await updateSolicitud(editingSolicitud.id, data);
        addToast({
          title: 'Solicitud actualizada',
          description: `La solicitud "${data.descripcion}" ha sido actualizada exitosamente.`,
          color: 'success'
        });
      } else {
        await createSolicitud(data);
        addToast({
          title: 'Solicitud creada',
          description: `La solicitud "${data.descripcion}" ha sido creada exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingSolicitud(null);
    } catch (error) {
      addToast({
        title: editingSolicitud ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingSolicitud(null);
  };

  const handleAprobar = async (solicitud: Solicitud) => {
    try {
      const aprobadorId = 1; 
      await aprobarSolicitud(solicitud.id, aprobadorId);
      addToast({
        title: 'Solicitud aprobada',
        description: `La solicitud "${solicitud.descripcion}" ha sido aprobada.`,
        color: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error al aprobar',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };


  const actions = [
    {
      icon: <Edit className="h-4 w-4" />,
      label: 'Editar',
      onClick: handleEdit,
      color: 'primary' as const
    },
    {
      icon: <CheckCircle className="h-4 w-4" />,
      label: 'Aprobar',
      onClick: handleAprobar,
      color: 'success' as const,
      condition: (solicitud: Solicitud) => solicitud.estado === 'PENDIENTE'
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
        <div className="text-lg text-gray-600 dark:text-gray-400">Cargando solicitudes...</div>
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
            Gestión de Solicitudes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las solicitudes de material del sistema
          </p>
        </div>
      </div>

      <DataTable
        data={solicitudes}
        columns={columns}
        actions={actions}
        onCreate={handleCreate}
        getRowId={(solicitud) => solicitud.id}
        title="Lista de Solicitudes"
        searchPlaceholder="Buscar solicitudes..."
        emptyMessage="No se encontraron solicitudes"
        createButtonLabel="Nueva Solicitud"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingSolicitud || { descripcion: '', estado: 'PENDIENTE' }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default SolicitudPage;