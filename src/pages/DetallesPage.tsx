import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '../components/molecules/GenericForm';
import { useDetalles } from '../hooks/useDetalles';
import { useMaterial } from '../hooks/useMaterial';
import { useSolicitud } from '../hooks/useSolicitud';
import { usePersona } from '../hooks/usePersona';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

import { Detalles } from '../types/detalles.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Package, Check, X, History, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

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
    accessorKey: 'solicitud',
    header: 'Solicitante',
    sortable: true,
    cell: (row: Detalles) => (
      <span className="text-sm text-gray-600">
        {row.solicitud?.solicitante ? `${row.solicitud.solicitante.nombre} ${row.solicitud.solicitante.apellido || ''}` : 'Sin asignar'}
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
    accessorKey: 'estado',
    header: 'Estado',
    sortable: true,
    cell: (row: Detalles) => {
      const getEstadoBadge = (estado: string) => {
        switch (estado) {
          case 'PENDIENTE':
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5"></div>
                Pendiente
              </span>
            );
          case 'APROBADO':
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <Check className="w-3 h-3 mr-1" />
                Aprobado
              </span>
            );
          case 'RECHAZADO':
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                <X className="w-3 h-3 mr-1" />
                Rechazado
              </span>
            );
          default:
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                {estado}
              </span>
            );
        }
      };
      return getEstadoBadge(row.estado);
    }
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

// Dentro del componente DetallesPage
const DetallesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    detalles,
    loading,
    error,
    createDetalle,
    updateDetalle,
    deleteDetalle,
    aprobarDetalle,
    rechazarDetalle
  } = useDetalles();

  const { materiales } = useMaterial();
  const { solicitudes } = useSolicitud();
  const { personas } = usePersona();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDetalle, setEditingDetalle] = useState<Detalles | null>(null);

  const handleAprobar = async (detalle: Detalles) => {
    if (!user?.usuario.id) {
      addToast({
        title: 'Error de autenticación',
        description: 'No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.',
        color: 'danger'
      });
      return;
    }

    if (detalle.estado !== 'PENDIENTE') {
      addToast({
        title: 'Error de validación',
        description: 'Solo se pueden aprobar detalles en estado PENDIENTE.',
        color: 'warning'
      });
      return;
    }

    try {
      console.log('=== INICIANDO APROBACIÓN DESDE FRONTEND ===');
      console.log('Usuario que aprueba:', user.usuario.id, user.usuario.nombre);
      console.log('Detalle a aprobar:', detalle.id, 'Estado actual:', detalle.estado);
      
      await aprobarDetalle(detalle.id, user.usuario.id);
      
      addToast({
        title: 'Aprobación exitosa',
        description: `Detalle #${detalle.id} aprobado correctamente. El movimiento ha sido ejecutado y el stock actualizado.`,
        color: 'success'
      });
      
      console.log('=== APROBACIÓN COMPLETADA DESDE FRONTEND ===');
    } catch (error) {
      console.error('Error en aprobación:', error);
      addToast({
        title: 'Error al aprobar',
        description: error instanceof Error ? error.message : 'Error desconocido al aprobar el detalle',
        color: 'danger'
      });
    }
  };

  const handleRechazar = async (detalle: Detalles) => {
    if (!user?.usuario.id) {
      addToast({
        title: 'Error de autenticación',
        description: 'No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.',
        color: 'danger'
      });
      return;
    }

    if (detalle.estado !== 'PENDIENTE') {
      addToast({
        title: 'Error de validación',
        description: 'Solo se pueden rechazar detalles en estado PENDIENTE.',
        color: 'warning'
      });
      return;
    }

    try {
      console.log('=== INICIANDO RECHAZO DESDE FRONTEND ===');
      console.log('Usuario que rechaza:', user.usuario.id, user.usuario.nombre);
      console.log('Detalle a rechazar:', detalle.id, 'Estado actual:', detalle.estado);
      
      await rechazarDetalle(detalle.id, user.usuario.id);
      
      addToast({
        title: 'Rechazo exitoso',
        description: `Detalle #${detalle.id} rechazado correctamente.`,
        color: 'success'
      });
      
      console.log('=== RECHAZO COMPLETADO DESDE FRONTEND ===');
    } catch (error) {
      console.error('Error en rechazo:', error);
      addToast({
        title: 'Error al rechazar',
        description: error instanceof Error ? error.message : 'Error desconocido al rechazar el detalle',
        color: 'danger'
      });
    }
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

  const actions = [
    {
      icon: <Check className="h-4 w-4" />,
      label: 'Aprobar',
      onClick: handleAprobar,
      color: 'success' as const,
      condition: (row: Detalles) => row.estado === 'PENDIENTE'
    },
    {
      icon: <X className="h-4 w-4" />,
      label: 'Rechazar',
      onClick: handleRechazar,
      color: 'warning' as const,
      condition: (row: Detalles) => row.estado === 'PENDIENTE'
    },
    {
      icon: <Edit className="h-4 w-4" />,
      label: 'Editar',
      onClick: handleEdit,
      color: 'primary' as const,
      condition: (row: Detalles) => row.estado === 'PENDIENTE'
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: 'Eliminar',
      onClick: handleDelete,
      color: 'danger' as const,
      condition: (row: Detalles) => row.estado === 'PENDIENTE'
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
      name: 'personaApruebaId',
      label: 'Persona que Aprueba',
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
        await createDetalle({
          ...data,
          cantidad: data.cantidad || 0
        } as Detalles);
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

  const { canView } = usePermissions();

  if (!canView('detalles')) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <X className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Acceso Denegado</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">No tienes permisos para ver los detalles.</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Contacta al administrador si necesitas acceso.</p>
      </div>
    );
  }

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

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Historial de Detalles</h3>
            <p className="text-blue-100 mb-4">
              Consulta el historial completo de detalles procesados en el sistema
            </p>
            <button
              onClick={() => navigate('/historial-detalles')}
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
            >
              <History className="w-4 h-4 mr-2" />
              Ver Historial Completo
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          <div className="hidden md:block">
            <History className="w-16 h-16 text-blue-200" />
          </div>
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


