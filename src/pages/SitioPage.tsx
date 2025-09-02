import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '../components/molecules/GenericForm';
import { useSitio } from '../hooks/useSitio';
import { useTipoSitio } from '../hooks/useTipoSitio';
import { Sitio } from '../types/sitio.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Settings, ExternalLink, MapPin, Hash, Calendar, CheckCircle, XCircle, Building2 } from 'lucide-react';
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

const SitioPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    sitios,
    error,
    createSitio,
    updateSitio,
    deleteSitio
  } = useSitio();

  const { tiposSitio } = useTipoSitio();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSitio, setEditingSitio] = useState<Sitio | null>(null);

  const columns: Column<Sitio>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px',
      cell: (row: Sitio) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">#{row.id}</span>
        </div>
      )
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      sortable: true,
      cell: (row: Sitio) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      )
    },
    {
      accessorKey: 'tipoSitio',
      header: 'Tipo de Sitio',
      sortable: true,
      cell: (row: Sitio) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {row.tipoSitio?.nombre || 'Sin tipo'}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Sitio) => (
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
      cell: (row: Sitio) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <span>{new Date(row.fechaCreacion).toLocaleDateString('es-ES')}</span>
        </div>
      )
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Sitio) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-orange-500" />
          <span>
            {row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'}
          </span>
        </div>
      )
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

    const result = await Swal.fire({
      title: '¿Eliminar Sitio?',
      text: `¿Está seguro de que desea eliminar el sitio "${sitio.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteSitio(id);
        addToast({
          title: 'Sitio eliminado',
          description: `El sitio "${sitio.nombre}" ha sido eliminado exitosamente.`,
          color: 'success'
        });
        
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El sitio ha sido eliminado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        addToast({
          title: 'Error al eliminar',
          description: error instanceof Error ? error.message : 'Error desconocido al eliminar el sitio',
          color: 'danger'
        });
        
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el sitio. Inténtelo nuevamente.',
          icon: 'error'
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
      
      // Mecanismo de refresh mejorado
      setTimeout(() => {
        // El hook useSitio debería refrescar automáticamente los datos
      }, 100);
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

      {/* Banner de navegación a tipos de sitio */}
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