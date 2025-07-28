import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm } from '../components/molecules/GenericForm';
import { useRol } from '../hooks/useRol';
import { Rol } from '../types/rol.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Users } from 'lucide-react';

// Importar el tipo Column del DataTable
type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const RolPage: React.FC = () => {
  const {
    roles,
    error,
    createRol,
    updateRol,
    deleteRol
  } = useRol();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);

  // Definir las columnas de la tabla
  const columns: Column<Rol>[] = [
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
      cell: (row: Rol) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Rol) => (
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
      cell: (row: Rol) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Rol) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];

  // Definir los campos del formulario
  const formFields = [
    {
      name: 'nombre' as keyof Rol,
      label: 'Nombre del Rol',
      type: 'text' as const,
      required: true
    },
    {
      name: 'activo' as keyof Rol,
      label: 'Estado Activo',
      type: 'checkbox' as const,
      required: false
    }
  ];

  // Manejar la creación de rol
  const handleCreate = () => {
    setEditingRol(null);
    setIsFormOpen(true);
  };

  // Manejar la edición de rol
  const handleEdit = (rol: Rol) => {
    setEditingRol(rol);
    setIsFormOpen(true);
  };

  // Manejar la eliminación de rol
  const handleDelete = async (id: number) => {
    const rol = roles.find(r => r.id === id);
    if (!rol) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el rol "${rol.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteRol(id);
        addToast({
          title: 'Rol eliminado',
          description: `El rol "${rol.nombre}" ha sido eliminado exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar el rol',
          color: 'danger'
        });
      }
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (data: Partial<Rol>) => {
    try {
      if (editingRol) {
        // Actualizar rol existente
        await updateRol(editingRol.id, data);
        addToast({
          title: 'Rol actualizado',
          description: `El rol "${data.nombre}" ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        // Crear nuevo rol
        await createRol(data);
        addToast({
          title: 'Rol creado',
          description: `El rol "${data.nombre}" ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingRol(null);
    } catch (error) {
      addToast({
        title: editingRol ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  // Manejar cancelación del formulario
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingRol(null);
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
      onClick: (rol: Rol) => handleDelete(rol.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los roles
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
            Gestión de Roles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los roles de usuario del sistema
          </p>
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={roles}
        columns={columns}
        title="Roles"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(rol) => rol.id}
        searchPlaceholder="Buscar roles..."
        emptyMessage="No se encontraron roles"
        createButtonLabel="Nuevo Rol"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {/* Formulario modal */}
      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingRol || { nombre: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default RolPage;