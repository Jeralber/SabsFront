import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm } from '../components/molecules/GenericForm';
import { useUnidadMedida } from '../hooks/useUnidadMedida';
import { UnidadMedida } from '../types/unidad-medida.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2 } from 'lucide-react';
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

const UnidadMedidaPage: React.FC = () => {
  const {
    unidadesMedida,
    error,
    createUnidadMedida,
    updateUnidadMedida, 
    deleteUnidadMedida
  } = useUnidadMedida();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnidadMedida, setEditingUnidadMedida] = useState<UnidadMedida | null>(null);
  const navigate = useNavigate();

  const columns: Column<UnidadMedida>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      accessorKey: 'unidad' ,
      header: 'Unidad',
      sortable: true,
      cell: (row: UnidadMedida) => (
       <div className="flex items-center gap-2">
          <div className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.unidad}</span>
        </div>
      )
    },
    {
      accessorKey: 'simbolo' as keyof UnidadMedida,
      header: 'Símbolo',
      sortable: true,
      cell: (row: UnidadMedida) => (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
          {row.simbolo}
        </span>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: UnidadMedida) => (
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
      cell: (row: UnidadMedida) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: UnidadMedida) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];

  const formFields = [
    {
      name: 'unidad' as keyof UnidadMedida,
      label: 'Nombre de la Unidad',
      type: 'text' as const,
      required: true
    },
    {
      name: 'simbolo' as keyof UnidadMedida,
      label: 'Símbolo',
      type: 'text' as const,
      required: true
    },
    {
      name: 'activo' as keyof UnidadMedida,
      label: 'Estado Activo',
      type: 'checkbox' as const,
      required: false
    }
  ];

  const handleCreate = () => {
    setEditingUnidadMedida(null);
    setIsFormOpen(true);
  };

  const handleEdit = (unidadMedida: UnidadMedida) => {
    setEditingUnidadMedida(unidadMedida);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const unidadMedida = unidadesMedida.find(u => u.id === id);
    if (!unidadMedida) return;

    const result = await Swal.fire({
      title: '¿Eliminar unidad de medida?',
      text: `Se eliminará "${unidadMedida.unidad}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteUnidadMedida(id);
        await Swal.fire({
          title: 'Eliminado',
          text: `La unidad de medida "${unidadMedida.unidad}" ha sido eliminada.`,
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
      } catch (error) {
        await Swal.fire({
          title: 'Error al eliminar',
          text: error instanceof Error ? error.message : 'Error desconocido al eliminar la unidad de medida',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    }
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
      onClick: (unidadMedida: UnidadMedida) => handleDelete(unidadMedida.id),
      variant: 'danger' as const
    }
  ];

  const handleSubmit = async (data: Partial<UnidadMedida>) => {
    try {
      if (editingUnidadMedida) {
        await updateUnidadMedida(editingUnidadMedida.id, data);
        addToast({
          title: 'Unidad de medida actualizada',
          description: `La unidad de medida "${data.unidad}" ha sido actualizada exitosamente.`,
          color: 'success'
        });
      } else {
        await createUnidadMedida(data);
        addToast({
          title: 'Unidad de medida creada',
          description: `La unidad de medida "${data.unidad}" ha sido creada exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingUnidadMedida(null);
    } catch (error) {
      addToast({
        title: editingUnidadMedida ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingUnidadMedida(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar las unidades de medida
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
            Gestión de Unidades de Medida
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las unidades de medida del sistema
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
        data={unidadesMedida}
        columns={columns}
        title="Unidades de Medida"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(unidadMedida) => unidadMedida.id}
        searchPlaceholder="Buscar unidades de medida..."
        emptyMessage="No se encontraron unidades de medida"
        createButtonLabel="Nueva Unidad de Medida"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingUnidadMedida || { unidad: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default UnidadMedidaPage;