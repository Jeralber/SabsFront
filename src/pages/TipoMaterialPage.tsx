import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm } from '../components/molecules/GenericForm';
import { useTipoMaterial } from '../hooks/useTipoMaterial';
import { TipoMaterial } from '../types/tipo-material.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Hash, Package, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const TipoMaterialPage: React.FC = () => {
  const {
    tiposMaterial,
    error,
    createTipoMaterial,
    updateTipoMaterial,
    deleteTipoMaterial,
    loading
  } = useTipoMaterial();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTipoMaterial, setEditingTipoMaterial] = useState<TipoMaterial | null>(null);
  const navigate = useNavigate();

  const columns: Column<TipoMaterial>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px',
      cell: (row: TipoMaterial) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{row.id}</span>
        </div>
      )
    },
    {
      accessorKey: 'tipo' as keyof TipoMaterial,
      header: 'Tipo',
      sortable: true,
      cell: (row: TipoMaterial) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.tipo}</span>
        </div>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: TipoMaterial) => (
        <div className="flex items-center gap-2">
          {row.activo ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.activo 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {row.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'fechaCreacion',
      header: 'Fecha Creación',
      sortable: true,
      isDate: true,
      cell: (row: TipoMaterial) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{new Date(row.fechaCreacion).toLocaleDateString('es-ES')}</span>
        </div>
      )
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: TipoMaterial) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>
            {row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'}
          </span>
        </div>
      )
    }
  ];

  const formFields = [
    {
      name: 'tipo' as keyof TipoMaterial, 
      label: 'Nombre del Tipo de Material',
      type: 'text' as const,
      required: true
    },
    {
      name: 'activo' as keyof TipoMaterial,
      label: 'Estado Activo',
      type: 'checkbox' as const,
      required: false
    }
  ];

  const handleCreate = () => {
    setEditingTipoMaterial(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tipoMaterial: TipoMaterial) => {
    setEditingTipoMaterial(tipoMaterial);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const tipoMaterial = tiposMaterial.find(t => t.id === id);
    if (!tipoMaterial) return;

    const result = await Swal.fire({
      title: '¿Eliminar tipo de material?',
      text: `¿Está seguro de que desea eliminar el tipo de material "${tipoMaterial.tipo}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteTipoMaterial(id);
        addToast({
          title: 'Tipo de material eliminado',
          description: `El tipo de material "${tipoMaterial.tipo}" ha sido eliminado exitosamente.`,
          color: 'success'
        });
        
        // Mecanismo de refresh mejorado
        setTimeout(() => {
          // El hook useTipoMaterial debería refrescar automáticamente los datos
        }, 100);
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar el tipo de material',
          color: 'danger'
        });
      }
    }
  };

  const handleSubmit = async (data: Partial<TipoMaterial>) => {
    try {
      if (editingTipoMaterial) {
        await updateTipoMaterial(editingTipoMaterial.id, data);
        addToast({
          title: 'Tipo de material actualizado',
          description: `El tipo de material "${data.tipo}" ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        await createTipoMaterial(data);
        addToast({
          title: 'Tipo de material creado',
          description: `El tipo de material "${data.tipo}" ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingTipoMaterial(null);
      
      // Mecanismo de refresh mejorado
      setTimeout(() => {
        // El hook useTipoMaterial debería refrescar automáticamente los datos
      }, 100);
    } catch (error) {
      addToast({
        title: editingTipoMaterial ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingTipoMaterial(null);
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
      onClick: (tipoMaterial: TipoMaterial) => handleDelete(tipoMaterial.id),
      variant: 'danger' as const
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Cargando tipos de material...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los tipos de material
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
            Gestión de Tipos de Material
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los tipos de material del sistema
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
        data={tiposMaterial}
        columns={columns}
        title="Tipos de Material"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(tipoMaterial) => tipoMaterial.id}
        searchPlaceholder="Buscar tipos de material..."
        emptyMessage="No se encontraron tipos de material"
        createButtonLabel="Nuevo Tipo de Material"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingTipoMaterial || { tipo: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default TipoMaterialPage;