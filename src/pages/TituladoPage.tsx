import { useState } from 'react';
import { DataTable } from '@/components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '@/components/molecules/GenericForm';
import { useTitulado } from '@/hooks/useTitulado';
import { useArea } from '@/hooks/useArea';
import { useFicha } from '@/hooks/useFicha';
import { Titulado } from '@/types/titulado.types';
import { Edit, Trash, GraduationCap } from 'lucide-react';
import { addToast } from '@heroui/react';

interface Column<T> {
  accessorKey: keyof T;
  header: string;
  sortable?: boolean;
  isDate?: boolean;
  cell?: (row: T) => React.ReactNode;
}

const TituladoPage: React.FC = () => {
  const {
    titulados,
    error,
    createTitulado,
    updateTitulado,
    deleteTitulado
  } = useTitulado();

  const { areas } = useArea();
  const { fichas } = useFicha();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTitulado, setEditingTitulado] = useState<Titulado | null>(null);

  const columns: Column<Titulado>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      sortable: true,
      cell: (row: Titulado) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      )
    },
    {
      accessorKey: 'area',
      header: 'Área',
      sortable: true,
      cell: (row: Titulado) => (
        <span className="text-gray-600 dark:text-gray-300">
          {row.area?.nombre || 'Sin área'}
        </span>
      )
    },
    {
      accessorKey: 'ficha',
      header: 'Ficha',
      sortable: true,
      cell: (row: Titulado) => (
        <span className="text-gray-600 dark:text-gray-300">
          {row.ficha ? `Ficha ${row.ficha.numero}` : 'Sin ficha'}
        </span>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Titulado) => (
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
      cell: (row: Titulado) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Titulado) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];

  const formFields: FieldDefinition<Titulado>[] = [
    {
      name: 'nombre',
      label: 'Nombre del Titulado',
      type: 'text',
      required: true
    },
    {
      name: 'areaId',
      label: 'Área',
      type: 'select',
      required: false,
      options: areas.map(area => ({
        label: area.nombre,
        value: area.id
      }))
    },
    {
      name: 'fichaId',
      label: 'Ficha',
      type: 'select',
      required: false,
      options: fichas.map(ficha => ({
        label: `Ficha ${ficha.numero}`,
        value: ficha.id
      }))
    },
    {
      name: 'activo',
      label: 'Estado Activo',
      type: 'checkbox',
      required: false
    }
  ];

  const handleCreate = () => {
    setEditingTitulado(null);
    setIsFormOpen(true);
  };

  const handleEdit = (titulado: Titulado) => {
    setEditingTitulado(titulado);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTitulado(id);
      addToast({
        title: 'Éxito',
        description: 'Titulado eliminado correctamente',
        color: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Error al eliminar el titulado',
        color: 'danger'
      });
    }
  };

  const handleSubmit = async (data: Partial<Titulado>) => {
    try {
      if (editingTitulado) {
        await updateTitulado(editingTitulado.id, data);
        addToast({
          title: 'Éxito',
          description: 'Titulado actualizado correctamente',
          color: 'success'
        });
      } else {
        await createTitulado(data);
        addToast({
          title: 'Éxito',
          description: 'Titulado creado correctamente',
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingTitulado(null);
    } catch (error) {
      addToast({
        title: 'Error',
        description: editingTitulado ? 'Error al actualizar el titulado' : 'Error al crear el titulado',
        color: 'danger'
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingTitulado(null);
  };

  const actions = [
    {
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: (row: Titulado) => handleEdit(row),
      variant: 'primary' as const
    },
    {
      label: 'Eliminar',
      icon: <Trash size={16} />,
      onClick: (row: Titulado) => handleDelete(row.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar los datos</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Titulados</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los titulados del sistema
          </p>
        </div>
      </div>

      <DataTable
        data={titulados}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        actions={actions}
        getRowId={(row) => row.id}
        title="Lista de Titulados"
        searchPlaceholder="Buscar titulados..."
        emptyMessage="No se encontraron titulados"
        createButtonLabel="Nuevo Titulado"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />


      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingTitulado || { nombre: '', areaId: undefined, fichaId: undefined, activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default TituladoPage;