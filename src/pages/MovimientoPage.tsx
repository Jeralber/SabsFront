import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '../components/molecules/GenericForm';
import { useMovimiento } from '../hooks/useMovimiento';
import { useTipoMovimiento } from '../hooks/useTipoMovimiento';
import { usePersona } from '../hooks/usePersona';
import { useMaterial } from '../hooks/useMaterial';
//import { useSolicitud } from '../hooks/useSolicitud';
import { Movimiento } from '../types/movimiento.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

// Importar el tipo Column del DataTable
type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const MovimientoPage: React.FC = () => {
  const {
    movimientos,
    loading,
    error,
    createMovimiento,
    updateMovimiento,
    deleteMovimiento
  } = useMovimiento();

  const { tiposMovimiento } = useTipoMovimiento();
  const { personas } = usePersona();
  const { materiales } = useMaterial();
// Removed unused solicitudes declaration since it's not being used anywhere in the component

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState<Movimiento | null>(null);

  // Definir las columnas de la tabla
  const columns: Column<Movimiento>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      accessorKey: 'tipoMovimiento',
      header: 'Tipo',
      sortable: true,
      cell: (row: Movimiento) => (
        <div className="flex items-center gap-2">
          {row.tipoMovimiento?.nombre?.toLowerCase().includes('entrada') ? 
            <ArrowUp className="h-4 w-4 text-green-500" /> : 
            <ArrowDown className="h-4 w-4 text-red-500" />
          }
          <span className="font-medium">{row.tipoMovimiento?.nombre || 'Sin tipo'}</span>
        </div>
      )
    },
    {
      accessorKey: 'material',
      header: 'Material',
      sortable: true,
      cell: (row: Movimiento) => (
        <span className="text-sm text-gray-600">
          {row.material?.nombre || 'Sin material'}
        </span>
      )
    },
    {
      accessorKey: 'cantidad',
      header: 'Cantidad',
      sortable: true,
      cell: (row: Movimiento) => (
        <span className="font-semibold text-blue-600">
          {row.cantidad}
        </span>
      )
    },
    {
      accessorKey: 'persona',
      header: 'Persona',
      sortable: true,
      cell: (row: Movimiento) => (
        <span className="text-sm text-gray-600">
          {row.persona ? `${row.persona.nombre} ${row.persona.apellido || ''}` : 'Sin asignar'}
        </span>
      )
    },
    {
      accessorKey: 'solicitud',
      header: 'Solicitud',
      sortable: true,
      cell: (row: Movimiento) => (
        <span className="text-sm text-gray-600">
          {row.solicitud?.descripcion || 'Sin solicitud'}
        </span>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Movimiento) => (
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
      width: '150px'
    }
  ];

  // Definir los campos del formulario
  const formFields: FieldDefinition<Movimiento>[] = [
    {
      name: 'tipoMovimientoId',
      label: 'Tipo de Movimiento',
      type: 'select',
      required: true,
      options: tiposMovimiento.map(tipo => ({
        value: tipo.id,
        label: tipo.nombre
      }))
    },
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
      name: 'personaId',
      label: 'Persona',
      type: 'select',
      options: personas.map(persona => ({
        value: persona.id,
        label: `${persona.nombre} ${persona.apellido || ''}`
      }))
    },
    {
      name: 'activo',
      label: 'Activo',
      type: 'checkbox'
    }
  ];

  // Manejar la creación de nuevo movimiento
  const handleCreate = () => {
    setEditingMovimiento(null);
    setIsFormOpen(true);
  };

  // Manejar la edición de movimiento
  const handleEdit = (movimiento: Movimiento) => {
    setEditingMovimiento(movimiento);
    setIsFormOpen(true);
  };

  // Manejar la eliminación de movimiento
  const handleDelete = async (movimiento: Movimiento) => {
    try {
      await deleteMovimiento(movimiento.id);
      addToast({
        title: 'Movimiento eliminado',
        description: `El movimiento ha sido eliminado exitosamente.`,
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

  // Manejar el envío del formulario
  const handleSubmit = async (data: Partial<Movimiento>) => {
    try {
      if (editingMovimiento) {
        // Actualizar movimiento existente
        await updateMovimiento(editingMovimiento.id, data);
        addToast({
          title: 'Movimiento actualizado',
          description: `El movimiento ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        // Crear nuevo movimiento
        await createMovimiento(data);
        addToast({
          title: 'Movimiento creado',
          description: `El movimiento ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingMovimiento(null);
    } catch (error) {
      addToast({
        title: editingMovimiento ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  // Manejar la cancelación del formulario
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingMovimiento(null);
  };

  // Definir las acciones de la tabla
  const actions = [
    {
      icon: <Edit className="h-4 w-4" />,
      label: 'Editar',
      onClick: handleEdit,
      color: 'primary' as const
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: 'Eliminar',
      onClick: handleDelete,
      color: 'danger' as const
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Cargando movimientos...</div>
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
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de Movimientos
        </h1>
      </div>

      <DataTable
        data={movimientos}
        columns={columns}
        actions={actions}
        onCreate={handleCreate}
        getRowId={(movimiento) => movimiento.id}
        title="Lista de Movimientos"
        searchPlaceholder="Buscar movimientos..."
        emptyMessage="No se encontraron movimientos"
        createButtonLabel="Nuevo Movimiento"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {/* Formulario modal */}
      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingMovimiento || { cantidad: 0, activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default MovimientoPage;