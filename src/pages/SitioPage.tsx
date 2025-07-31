import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '../components/molecules/GenericForm';
import { useSitio } from '../hooks/useSitio';
import { useTipoSitio } from '../hooks/useTipoSitio';
import { Sitio } from '../types/sitio.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Settings, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const SitioPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    sitios,
    error,
    createSitio,
    updateSitio,
    deleteSitio
  } = useSitio();

  const { tiposSitio, createTipoSitio } = useTipoSitio();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSitio, setEditingSitio] = useState<Sitio | null>(null);


  const columns: Column<Sitio>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      sortable: true
    },
    {
      accessorKey: 'tipoSitio',
      header: 'Tipo de Sitio',
      sortable: true,
      cell: (row: Sitio) => (
        <span className="text-sm text-gray-600">
          {row.tipoSitio?.nombre || 'Sin tipo'}
        </span>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Sitio) => (
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
      cell: (row: Sitio) => new Date(row.fechaCreacion).toLocaleDateString('es-ES')
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Sitio) => 
        row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'
    }
  ];


  const formFields: FieldDefinition<Sitio>[] = [
    {
      name: 'nombre',
      label: 'Nombre del Sitio',
      type: 'text',
      required: true
    },
    {
      name: 'tipoSitioId',
      label: 'Tipo de Sitio',
      type: 'select',
      required: false,
      options: tiposSitio.map(tipo => ({
        label: tipo.nombre,
        value: tipo.id
      })),
      allowQuickCreate: true,
      quickCreateTitle: 'Crear Nuevo Tipo de Sitio',
      quickCreateFields: [
        {
          name: 'nombre',
          label: 'Nombre',
          type: 'text',
          required: true
        },
        {
          name: 'activo',
          label: 'Activo',
          type: 'checkbox',
          required: false
        }
      ],
      onQuickCreate: async (data) => {
        const response = await createTipoSitio({ ...data, activo: data.activo ?? true });
        const newTipoSitio = response.data;
        if (!newTipoSitio || Array.isArray(newTipoSitio)) {
          throw new Error('Error al crear el tipo de sitio');
        }
        return {
          id: newTipoSitio.id,
          label: newTipoSitio.nombre
        };
      }
    },
    {
      name: 'activo',
      label: 'Estado Activo',
      type: 'checkbox',
      required: false
    }
  ];

  const handleCreate = () => {
    setEditingSitio(null);
    setIsFormOpen(true);
  };

  const handleEdit = (sitio: Sitio) => {
    setEditingSitio(sitio);
    setIsFormOpen(true);
  };


  const handleDelete = async (id: number) => {
    const sitio = sitios.find(s => s.id === id);
    if (!sitio) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el sitio "${sitio.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteSitio(id);
        addToast({
          title: 'Sitio eliminado',
          description: `El sitio "${sitio.nombre}" ha sido eliminado exitosamente.`,
          color: 'success'
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar el sitio',
          color: 'danger'
        });
      }
    }
  };


  const handleSubmit = async (data: Partial<Sitio>) => {
    try {
      if (editingSitio) {
        await updateSitio(editingSitio.id, data);
        addToast({
          title: 'Sitio actualizado',
          description: `El sitio "${data.nombre}" ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        await createSitio(data);
        addToast({
          title: 'Sitio creado',
          description: `El sitio "${data.nombre}" ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      setIsFormOpen(false);
      setEditingSitio(null);
    } catch (error) {
      addToast({
        title: editingSitio ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };


  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingSitio(null);
  };


  const handleNavigateToTipoSitio = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    navigate('/tipositios');
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
      onClick: (sitio: Sitio) => handleDelete(sitio.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los sitios
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
            Gestión de Sitios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los sitios del sistema
          </p>
        </div>
      </div>


      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Gestión de Tipos de Sitio</h3>
            <p className="text-green-100 mb-4">
              Administra los tipos de sitio disponibles en el sistema
            </p>
            <button
              onClick={handleNavigateToTipoSitio}
              className="inline-flex items-center px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200 font-medium"
            >
              <Settings className="w-4 h-4 mr-2" />
              Gestionar Tipos de Sitio
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          <div className="hidden md:block">
            <Settings className="w-16 h-16 text-green-200" />
          </div>
        </div>
      </div>


      <DataTable
        data={sitios}
        columns={columns}
        title="Sitios"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(sitio) => sitio.id}
        searchPlaceholder="Buscar sitios..."
        emptyMessage="No se encontraron sitios"
        createButtonLabel="Nuevo Sitio"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />


      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingSitio || { nombre: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default SitioPage;