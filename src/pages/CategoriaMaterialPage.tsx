import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, } from '../components/molecules/GenericForm';
import { useCategoriaMaterial } from '../hooks/useCategoriaMaterial';
import { CategoriaMaterial } from '../types/categoria-material.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const CategoriaMaterialPage: React.FC = () => {
  const {
    categoriasMaterial,
    error,
    createCategoriaMaterial,
    updateCategoriaMaterial,
    deleteCategoriaMaterial
  } = useCategoriaMaterial();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategoriaMaterial, setEditingCategoriaMaterial] = useState<CategoriaMaterial | null>(null);
  const navigate = useNavigate();


  const columns: Column<CategoriaMaterial>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px'
    },
    {   
      accessorKey: 'categoria', // Cambiar de 'nombre' a 'categoria'
      header: 'Categoría',
      sortable: true,
      cell: (row: CategoriaMaterial) => (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.categoria}</span>
        </div>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: CategoriaMaterial) => (
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
      cell: (row: CategoriaMaterial) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: CategoriaMaterial) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];


  const formFields = [
    {
      name: 'categoria' as keyof CategoriaMaterial, // Cambiar de 'nombre' a 'categoria'
      label: 'Nombre de la Categoría',
      type: 'text' as const,
      required: true
    },
    {
      name: 'activo' as keyof CategoriaMaterial,
      label: 'Estado Activo',
      type: 'checkbox' as const,
      required: false
    }
  ];

 
  const handleCreate = () => {
    setEditingCategoriaMaterial(null);
    setIsFormOpen(true);
  };

  
  const handleEdit = (categoriaMaterial: CategoriaMaterial) => {
    setEditingCategoriaMaterial(categoriaMaterial);
    setIsFormOpen(true);
  };


  const handleDelete = async (id: number) => {
    const categoriaMaterial = categoriasMaterial.find(c => c.id === id);
    if (!categoriaMaterial) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar la categoría de material "${categoriaMaterial.categoria}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteCategoriaMaterial(id);
        addToast({
          title: 'Categoría de material eliminada',
          description: `La categoría de material "${categoriaMaterial.categoria}" ha sido eliminada exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar la categoría de material',
          color: 'danger'
        });
      }
    }
  };


  const handleSubmit = async (data: Partial<CategoriaMaterial>) => {
    try {
      if (editingCategoriaMaterial) {
        await updateCategoriaMaterial(editingCategoriaMaterial.id, data);
        addToast({
          title: 'Categoría de material actualizada',
          description: `La categoría de material "${data.categoria}" ha sido actualizada exitosamente.`,
          color: 'success'
        });
      } else {
        await createCategoriaMaterial(data);
        addToast({
          title: 'Categoría de material creada',
          description: `La categoría de material "${data.categoria}" ha sido creada exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingCategoriaMaterial(null);
    } catch (error) {
      addToast({
        title: editingCategoriaMaterial ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

 
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingCategoriaMaterial(null);
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
      onClick: (categoriaMaterial: CategoriaMaterial) => handleDelete(categoriaMaterial.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar las categorías de material
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
            Gestión de Categorías de Material
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las categorías de material del sistema
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Volver
        </button>
      </div>


      <DataTable
        data={categoriasMaterial}
        columns={columns}
        title="Categorías de Material"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(categoriaMaterial) => categoriaMaterial.id}
        searchPlaceholder="Buscar categorías de material..."
        emptyMessage="No se encontraron categorías de material"
        createButtonLabel="Nueva Categoría de Material"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

  
      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingCategoriaMaterial || { categoria: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default CategoriaMaterialPage;