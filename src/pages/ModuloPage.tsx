import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm } from '../components/molecules/GenericForm';
import { useModulo } from '../hooks/useModulo';
import { Modulo } from '../types/modulo.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Database } from 'lucide-react';

// Importar el tipo Column del DataTable
type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const ModuloPage: React.FC = () => {
  const {
    modulos,
    error,
    createModulo,
    updateModulo,
    deleteModulo
  } = useModulo();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);

  // Definir las columnas de la tabla
  const columns: Column<Modulo>[] = [
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
      cell: (row: Modulo) => (
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      )
    }
  ];

  // Definir los campos del formulario
  const formFields = [
    {
      name: 'nombre' as keyof Modulo,
      label: 'Nombre del Módulo',
      type: 'text' as const,
      required: true
    }
  ];

  // Manejar la creación de módulo
  const handleCreate = () => {
    setEditingModulo(null);
    setIsFormOpen(true);
  };

  // Manejar la edición de módulo
  const handleEdit = (modulo: Modulo) => {
    setEditingModulo(modulo);
    setIsFormOpen(true);
  };

  // Manejar la eliminación de módulo
  const handleDelete = async (id: number) => {
    const modulo = modulos.find(m => m.id === id);
    if (!modulo) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el módulo "${modulo.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteModulo(id);
        addToast({
          title: 'Módulo eliminado',
          description: `El módulo "${modulo.nombre}" ha sido eliminado exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar el módulo',
          color: 'danger'
        });
      }
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (data: Partial<Modulo>) => {
    try {
      if (editingModulo) {
        // Actualizar módulo existente
        await updateModulo(editingModulo.id, data);
        addToast({
          title: 'Módulo actualizado',
          description: `El módulo "${data.nombre}" ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        // Crear nuevo módulo
        await createModulo(data);
        addToast({
          title: 'Módulo creado',
          description: `El módulo "${data.nombre}" ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingModulo(null);
    } catch (error) {
      addToast({
        title: editingModulo ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  // Manejar cancelación del formulario
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingModulo(null);
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
      onClick: (modulo: Modulo) => handleDelete(modulo.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los módulos
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
            Gestión de Módulos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los módulos del sistema
          </p>
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={modulos}
        columns={columns}
        title="Módulos"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(modulo) => modulo.id}
        searchPlaceholder="Buscar módulos..."
        emptyMessage="No se encontraron módulos"
        createButtonLabel="Nuevo Módulo"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {/* Formulario modal */}
      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingModulo || { nombre: '' }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default ModuloPage;