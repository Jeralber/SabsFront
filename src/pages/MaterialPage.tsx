import React, { useState } from 'react';
import { addToast } from '@heroui/react';
import { Edit, Trash2 } from 'lucide-react';
import { Material } from '../types/material.types';

import { useMaterial } from '../hooks/useMaterial';
import { useTipoMaterial } from '../hooks/useTipoMaterial';
import { useCategoriaMaterial } from '../hooks/useCategoriaMaterial';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '../components/molecules/GenericForm';

// Definir el tipo Column localmente
type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const MaterialPage: React.FC = () => {
  const {
    materiales,
    error,
    createMaterial,
    updateMaterial,
    deleteMaterial
  } = useMaterial();
  
  const { tiposMaterial } = useTipoMaterial();
  const { categoriasMaterial } = useCategoriaMaterial();
  
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Definir las columnas de la tabla
  const columns: Column<Material>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      sortable: true
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      sortable: true
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      sortable: true,
      cell: (row: Material) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.stock > 10
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : row.stock > 0
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {row.stock}
        </span>
      )
    },
    {
      accessorKey: 'tipoMaterial',
      header: 'Tipo',
      sortable: false,
      cell: (row: Material) => row.tipoMaterial?.tipo || 'Sin tipo'
    },
    {
      accessorKey: 'categoriaMaterial',
      header: 'Categoría',
      sortable: false,
      cell: (row: Material) => row.categoriaMaterial?.categoria || 'Sin categoría'
    },
    {
      accessorKey: 'caduca',
      header: 'Caduca',
      sortable: true,
      cell: (row: Material) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.caduca
            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {row.caduca ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      accessorKey: 'fechaVencimiento',
      header: 'Fecha Vencimiento',
      sortable: true,
      isDate: true,
      cell: (row: Material) => 
        row.fechaVencimiento ? new Date(row.fechaVencimiento).toLocaleDateString('es-ES') : 'N/A'
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Material) => (
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
      cell: (row: Material) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Material) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];

  // Definir los campos del formulario
  const formFields: FieldDefinition<Material>[] = [
    {
      name: 'nombre',
      label: 'Nombre del Material',
      type: 'text',
      required: true
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'text',
      required: true
    },
    {
      name: 'stock',
      label: 'Stock',
      type: 'number',
      required: true
    },
    {
      name: 'tipoMaterialId',
      label: 'Tipo de Material',
      type: 'select',
      required: false,
      options: tiposMaterial.map(tipo => ({
        value: tipo.id,
        label: tipo.tipo
      }))
    },
    {
      name: 'categoriaMaterialId',
      label: 'Categoría de Material',
      type: 'select',
      required: false,
      options: categoriasMaterial.map(categoria => ({
        value: categoria.id,
        label: categoria.categoria
      }))
    },
    {
      name: 'caduca',
      label: 'El material caduca',
      type: 'checkbox',
      required: false
    },
    {
      name: 'fechaVencimiento',
      label: 'Fecha de Vencimiento',
      type: 'date',
      required: false
    },
    {
      name: 'activo',
      label: 'Estado Activo',
      type: 'checkbox',
      required: false
    }
  ];

  // Manejar la creación de material
  const handleCreate = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  // Manejar la edición de material
  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  // Manejar la eliminación de material
  const handleDelete = async (id: number) => {
    const material = materiales.find(m => m.id === id);
    if (!material) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el material "${material.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteMaterial(id);
        addToast({
          title: 'Material eliminado',
          description: `El material "${material.nombre}" ha sido eliminado exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar el material',
          color: 'danger'
        });
      }
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (data: Partial<Material>) => {
    try {
      if (editingMaterial) {
        // Actualizar material existente
        await updateMaterial(editingMaterial.id, data);
        addToast({
          title: 'Material actualizado',
          description: `El material "${data.nombre}" ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        // Crear nuevo material
        await createMaterial(data);
        addToast({
          title: 'Material creado',
          description: `El material "${data.nombre}" ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingMaterial(null);
    } catch (error) {
      addToast({
        title: editingMaterial ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  // Manejar cancelación del formulario
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingMaterial(null);
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
      onClick: (material: Material) => handleDelete(material.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los materiales
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
            Gestión de Materiales
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra el inventario de materiales del sistema
          </p>
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={materiales}
        columns={columns}
        title="Materiales"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(material) => material.id}
        searchPlaceholder="Buscar materiales..."
        emptyMessage="No se encontraron materiales"
        createButtonLabel="Nuevo Material"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {/* Formulario modal */}
      {isFormOpen && (
        <GenericForm<Material>
          fields={formFields}
          initialValues={editingMaterial || { 
            nombre: '', 
            descripcion: '', 
            stock: 0, 
            caduca: false, 
            activo: true 
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default MaterialPage;