import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm } from '../components/molecules/GenericForm';
import { usePermiso } from '../hooks/usePermiso';
import { useOpcion } from '../hooks/useOpcion';
import { Permiso } from '../types/permiso.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Key } from 'lucide-react';


type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const PermisoPage: React.FC = () => {
  const {
    permisos,
    error,
    createPermiso,
    updatePermiso,
    deletePermiso
  } = usePermiso();

  const { opciones } = useOpcion();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPermiso, setEditingPermiso] = useState<Permiso | null>(null);


  const columns: Column<Permiso>[] = [
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
      cell: (row: Permiso) => (
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-orange-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      )
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      sortable: true,
      cell: (row: Permiso) => (
        <span className="text-gray-600 dark:text-gray-300">
          {row.descripcion || 'N/A'}
        </span>
      )
    },
    {
      accessorKey: 'codigo',
      header: 'Código',
      sortable: true,
      cell: (row: Permiso) => (
        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
          {row.codigo}
        </code>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Permiso) => (
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
      accessorKey: 'opcion',
      header: 'Opción',
      sortable: true,
      cell: (row: Permiso) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
          {row.opcion?.nombre || 'N/A'}
        </span>
      )
    },
    {
      accessorKey: 'fechaCreacion',
      header: 'Fecha Creación',
      sortable: true,
      isDate: true,
      cell: (row: Permiso) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Permiso) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];


  const formFields = [
    {
      name: 'nombre' as keyof Permiso,
      label: 'Nombre del Permiso',
      type: 'text' as const,
      required: true
    },
    {
      name: 'descripcion' as keyof Permiso,
      label: 'Descripción',
      type: 'text' as const,
      required: false
    },
    {
      name: 'codigo' as keyof Permiso,
      label: 'Código',
      type: 'text' as const,
      required: true
    },
    {
      name: 'activo' as keyof Permiso,
      label: 'Estado Activo',
      type: 'checkbox' as const,
      required: false
    },
    {
      name: 'opcionId' as keyof Permiso,
      label: 'Opción',
      type: 'select' as const,
      required: false,
      options: opciones.map(opcion => ({
        value: opcion.id,
        label: opcion.nombre
      }))
    }
  ];


  const handleCreate = () => {
    setEditingPermiso(null);
    setIsFormOpen(true);
  };

  const handleEdit = (permiso: Permiso) => {
    setEditingPermiso(permiso);
    setIsFormOpen(true);
  };


  const handleDelete = async (id: number) => {
    const permiso = permisos.find(p => p.id === id);
    if (!permiso) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el permiso "${permiso.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deletePermiso(id);
        addToast({
          title: 'Permiso eliminado',
          description: `El permiso "${permiso.nombre}" ha sido eliminado exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar el permiso',
          color: 'danger'
        });
      }
    }
  };


  const handleSubmit = async (data: Partial<Permiso>) => {
    try {
      if (editingPermiso) {
        await updatePermiso(editingPermiso.id, data);
        addToast({
          title: 'Permiso actualizado',
          description: `El permiso "${data.nombre}" ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        await createPermiso(data);
        addToast({
          title: 'Permiso creado',
          description: `El permiso "${data.nombre}" ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingPermiso(null);
    } catch (error) {
      addToast({
        title: editingPermiso ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingPermiso(null);
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
      onClick: (permiso: Permiso) => handleDelete(permiso.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los permisos
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
            Gestión de Permisos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los permisos del sistema
          </p>
        </div>
      </div>

      <DataTable
        data={permisos}
        columns={columns}
        title="Permisos"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(permiso) => permiso.id}
        searchPlaceholder="Buscar permisos..."
        emptyMessage="No se encontraron permisos"
        createButtonLabel="Nuevo Permiso"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingPermiso || { nombre: '', descripcion: '', codigo: '', activo: true, opcionId: 0 }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default PermisoPage;