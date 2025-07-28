import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm } from '../components/molecules/GenericForm';
import { useRolPermisoOpcion } from '../hooks/useRolPermisoOpcion';
import { useRol } from '../hooks/useRol';
import { usePermiso } from '../hooks/usePermiso';
import { useOpcion } from '../hooks/useOpcion';
import { RolPermisoOpcion } from '../types/rol-permiso-opcion.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Shield } from 'lucide-react';

// Importar el tipo Column del DataTable
type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const RolPermisoOpcionPage: React.FC = () => {
  const {
    rolPermisosOpciones,
    error,
    createRolPermisoOpcion,
    updateRolPermisoOpcion,
    deleteRolPermisoOpcion
  } = useRolPermisoOpcion();

  const { roles } = useRol();
  const { permisos } = usePermiso();
  const { opciones } = useOpcion();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRolPermisoOpcion, setEditingRolPermisoOpcion] = useState<RolPermisoOpcion | null>(null);

  // Definir las columnas de la tabla
  const columns: Column<RolPermisoOpcion>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      accessorKey: 'rol',
      header: 'Rol',
      sortable: true,
      cell: (row: RolPermisoOpcion) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-red-500" />
          <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium">
            {row.rol?.nombre || 'N/A'}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'permiso',
      header: 'Permiso',
      sortable: true,
      cell: (row: RolPermisoOpcion) => (
        <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-medium">
          {row.permiso?.nombre || 'N/A'}
        </span>
      )
    },
    {
      accessorKey: 'opcion',
      header: 'Opción',
      sortable: true,
      cell: (row: RolPermisoOpcion) => (
        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
          {row.opcion?.nombre || 'N/A'}
        </span>
      )
    }
  ];

  // Definir los campos del formulario
  const formFields = [
    {
      name: 'rolId' as keyof RolPermisoOpcion,
      label: 'Rol',
      type: 'select' as const,
      required: true,
      options: roles.map(rol => ({
        value: rol.id,
        label: rol.nombre
      }))
    },
    {
      name: 'permisoId' as keyof RolPermisoOpcion,
      label: 'Permiso',
      type: 'select' as const,
      required: true,
      options: permisos.map(permiso => ({
        value: permiso.id,
        label: permiso.nombre
      }))
    },
    {
      name: 'opcionId' as keyof RolPermisoOpcion,
      label: 'Opción',
      type: 'select' as const,
      required: true,
      options: opciones.map(opcion => ({
        value: opcion.id,
        label: opcion.nombre
      }))
    }
  ];

  // Manejar la creación de rol-permiso-opcion
  const handleCreate = () => {
    setEditingRolPermisoOpcion(null);
    setIsFormOpen(true);
  };

  // Manejar la edición de rol-permiso-opcion
  const handleEdit = (rolPermisoOpcion: RolPermisoOpcion) => {
    setEditingRolPermisoOpcion(rolPermisoOpcion);
    setIsFormOpen(true);
  };

  // Manejar la eliminación de rol-permiso-opcion
  const handleDelete = async (id: number) => {
    const rolPermisoOpcion = rolPermisosOpciones.find(rpo => rpo.id === id);
    if (!rolPermisoOpcion) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar esta asignación de rol-permiso-opción?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteRolPermisoOpcion(id);
        addToast({
          title: 'Asignación eliminada',
          description: 'La asignación de rol-permiso-opción ha sido eliminada exitosamente.',
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar la asignación',
          color: 'danger'
        });
      }
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (data: Partial<RolPermisoOpcion>) => {
    try {
      if (editingRolPermisoOpcion) {
        // Actualizar rol-permiso-opcion existente
        await updateRolPermisoOpcion(editingRolPermisoOpcion.id, data);
        addToast({
          title: 'Asignación actualizada',
          description: 'La asignación de rol-permiso-opción ha sido actualizada exitosamente.',
          color: 'success'
        });
      } else {
        // Crear nueva rol-permiso-opcion
        await createRolPermisoOpcion(data);
        addToast({
          title: 'Asignación creada',
          description: 'La asignación de rol-permiso-opción ha sido creada exitosamente.',
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingRolPermisoOpcion(null);
    } catch (error) {
      addToast({
        title: editingRolPermisoOpcion ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  // Manejar cancelación del formulario
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingRolPermisoOpcion(null);
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
      onClick: (rolPermisoOpcion: RolPermisoOpcion) => handleDelete(rolPermisoOpcion.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar las asignaciones
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
            Gestión de Rol-Permiso-Opciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las asignaciones de permisos a roles y opciones
          </p>
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={rolPermisosOpciones}
        columns={columns}
        title="Rol-Permiso-Opciones"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(rolPermisoOpcion) => rolPermisoOpcion.id}
        searchPlaceholder="Buscar asignaciones..."
        emptyMessage="No se encontraron asignaciones"
        createButtonLabel="Nueva Asignación"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {/* Formulario modal */}
      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingRolPermisoOpcion || { rolId: 0, permisoId: 0, opcionId: 0 }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default RolPermisoOpcionPage;