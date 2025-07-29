import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm } from '../components/molecules/GenericForm';
import { useOpcion } from '../hooks/useOpcion';
import { useModulo } from '../hooks/useModulo';
import { Opcion } from '../types/opcion.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Link } from 'lucide-react';

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const OpcionPage: React.FC = () => {
  const {
    opciones,
    error,
    createOpcion,
    updateOpcion,
    deleteOpcion
  } = useOpcion();

  const { modulos } = useModulo();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpcion, setEditingOpcion] = useState<Opcion | null>(null);

  const columns: Column<Opcion>[] = [
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
      cell: (row: Opcion) => (
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-green-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      )
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      sortable: true,
      cell: (row: Opcion) => (
        <span className="text-gray-600 dark:text-gray-300">
          {row.descripcion || 'N/A'}
        </span>
      )
    },
    {
      accessorKey: 'rutaFrontend',
      header: 'Ruta Frontend',
      sortable: true,
      cell: (row: Opcion) => (
        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
          {row.rutaFrontend}
        </code>
      )
    },
    {
      accessorKey: 'modulo',
      header: 'Módulo',
      sortable: true,
      cell: (row: Opcion) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
          {row.modulo?.nombre || 'N/A'}
        </span>
      )
    }
  ];

  const formFields = [
    {
      name: 'nombre' as keyof Opcion,
      label: 'Nombre de la Opción',
      type: 'text' as const,
      required: true
    },
    {
      name: 'descripcion' as keyof Opcion,
      label: 'Descripción',
      type: 'text' as const,
      required: false
    },
    {
      name: 'rutaFrontend' as keyof Opcion,
      label: 'Ruta Frontend',
      type: 'text' as const,
      required: true
    },
    {
      name: 'moduloId' as keyof Opcion,
      label: 'Módulo',
      type: 'select' as const,
      required: true,
      options: modulos.map(modulo => ({
        value: modulo.id,
        label: modulo.nombre
      }))
    }
  ];

 
  const handleCreate = () => {
    setEditingOpcion(null);
    setIsFormOpen(true);
  };

  const handleEdit = (opcion: Opcion) => {
    setEditingOpcion(opcion);
    setIsFormOpen(true);
  };

 
  const handleDelete = async (id: number) => {
    const opcion = opciones.find(o => o.id === id);
    if (!opcion) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar la opción "${opcion.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteOpcion(id);
        addToast({
          title: 'Opción eliminada',
          description: `La opción "${opcion.nombre}" ha sido eliminada exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar la opción',
          color: 'danger'
        });
      }
    }
  };


  const handleSubmit = async (data: Partial<Opcion>) => {
    try {
      if (editingOpcion) {
        await updateOpcion(editingOpcion.id, data);
        addToast({
          title: 'Opción actualizada',
          description: `La opción "${data.nombre}" ha sido actualizada exitosamente.`,
          color: 'success'
        });
      } else {

        await createOpcion(data);
        addToast({
          title: 'Opción creada',
          description: `La opción "${data.nombre}" ha sido creada exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingOpcion(null);
    } catch (error) {
      addToast({
        title: editingOpcion ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

 
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingOpcion(null);
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
      onClick: (opcion: Opcion) => handleDelete(opcion.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar las opciones
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
            Gestión de Opciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las opciones de menú del sistema
          </p>
        </div>
      </div>


      <DataTable
        data={opciones}
        columns={columns}
        title="Opciones"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(opcion) => opcion.id}
        searchPlaceholder="Buscar opciones..."
        emptyMessage="No se encontraron opciones"
        createButtonLabel="Nueva Opción"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

    
      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingOpcion || { nombre: '', descripcion: '', rutaFrontend: '', moduloId: 0 }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default OpcionPage;