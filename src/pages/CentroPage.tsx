import React, { useState, } from 'react';
import { addToast } from '@heroui/react';
import { Building2,  } from 'lucide-react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '../components/molecules/GenericForm';
import { useCentro } from '../hooks/useCentro';
import { useMunicipio } from '../hooks/useMunicipio';
import { Centro } from '../types/centro.types';


// Definir el tipo Column localmente
interface Column<T> {
  accessorKey: keyof T;
  header: string;
  sortable?: boolean;
  isDate?: boolean;
  cell?: (row: T) => React.ReactNode;
}

const CentroPage: React.FC = () => {
  const {
    centros,
    loading,
    error,
    createCentro,
    updateCentro,
    deleteCentro
  } = useCentro();

  const { municipios } = useMunicipio();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCentro, setEditingCentro] = useState<Centro | null>(null);
  const [formData, setFormData] = useState<Partial<Centro>>({});

  // Limpiar el formulario
  const resetForm = () => {
    setFormData({});
    setEditingCentro(null);
    setIsFormOpen(false);
  };

  // Manejar creación
  const handleCreate = () => {
    setFormData({ activo: true });
    setEditingCentro(null);
    setIsFormOpen(true);
  };

  const handleEdit = (centro: Centro) => {
    setFormData({
      nombre: centro.nombre,
      municipioId: centro.municipioId,
      activo: centro.activo
    });
    setEditingCentro(centro);
    setIsFormOpen(true);
  };


  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este centro?')) {
      try {
        await deleteCentro(id);
        addToast({
          title: 'Éxito',
          description: 'Centro eliminado correctamente',
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error',
          description: 'Error al eliminar el centro',
          color: 'danger'
        });
      }
    }
  };

 
  const handleSubmit = async (data: Partial<Centro>) => {
    try {
      if (editingCentro) {
        await updateCentro(editingCentro.id, data);
        addToast({
          title: 'Éxito',
          description: 'Centro actualizado correctamente',
          color: 'success'
        });
      } else {
        await createCentro(data);
        addToast({
          title: 'Éxito',
          description: 'Centro creado correctamente',
          color: 'success'
        });
      }
      resetForm();
    } catch (error) {
      addToast({
        title: 'Error',
        description: editingCentro ? 'Error al actualizar el centro' : 'Error al crear el centro',
        color: 'danger'
      });
    }
  };

  
  const handleCancel = () => {
    resetForm();
  };


  const columns: Column<Centro>[] = [
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
      accessorKey: 'municipio',
      header: 'Municipio',
      sortable: false,
      cell: (row: Centro) => row.municipio?.nombre || 'Sin municipio'
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Centro) => (
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
      header: 'Fecha de Creación',
      sortable: true,
      isDate: true,
      cell: (row: Centro) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Centro) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];

 
  const formFields: FieldDefinition<Centro>[] = [
    {
      name: 'nombre',
      label: 'Nombre del Centro',
      type: 'text',
      required: true
    },
    {
      name: 'municipioId',
      label: 'Municipio',
      type: 'select',
      required: false,
      options: municipios.map(municipio => ({
        value: municipio.id,
        label: municipio.nombre
      }))
    },
    {
      name: 'activo',
      label: 'Estado Activo',
      type: 'checkbox',
      required: false
    }
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Centros
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra los centros de formación
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-600 dark:text-gray-400">Cargando centros...</div>
        </div>
      ) : (
        <DataTable
          data={centros}
          columns={columns}
          title="Centros"
          onEdit={handleEdit}
          onCreate={handleCreate}
          onDelete={handleDelete}
          getRowId={(row) => row.id}
          searchPlaceholder="Buscar centros..."
          emptyMessage="No hay centros registrados"
          createButtonLabel="Nuevo Centro"
          showSearch={true}
          showColumnSelector={true}
        />
      )}

      {/* Formulario */}
      {isFormOpen && (
        <GenericForm<Centro>
          fields={formFields}
          initialValues={formData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default CentroPage;