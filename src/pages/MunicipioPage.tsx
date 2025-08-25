import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm } from '../components/molecules/GenericForm';
import { useMunicipio } from '../hooks/useMunicipio';
import { Municipio } from '../types/municipio.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, MapPin, Hash, CheckCircle, XCircle, Calendar, Clock, Settings, ExternalLink } from 'lucide-react';
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

const MunicipioPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    municipios,
    error,
    createMunicipio,
    updateMunicipio,
    deleteMunicipio,
    fetchMunicipios
  } = useMunicipio();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMunicipio, setEditingMunicipio] = useState<Municipio | null>(null);

  const columns: Column<Municipio>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px',
      cell: (row: Municipio) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{row.id}</span>
        </div>
      )
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      sortable: true,
      cell: (row: Municipio) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Municipio) => (
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
      cell: (row: Municipio) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{new Date(row.fechaCreacion).toLocaleDateString('es-ES')}</span>
        </div>
      )
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Municipio) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-500" />
          <span className="text-sm">
            {row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'}
          </span>
        </div>
      )
    }
  ];

  const formFields = [
    {
      name: 'nombre' as keyof Municipio,
      label: 'Nombre del Municipio',
      type: 'text' as const,
      required: true
    },
    {
      name: 'activo' as keyof Municipio,
      label: 'Estado Activo',
      type: 'checkbox' as const,
      required: false
    }
  ];

  const handleCreate = () => {
    setEditingMunicipio(null);
    setIsFormOpen(true);
  };

  const handleEdit = (municipio: Municipio) => {
    setEditingMunicipio(municipio);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const municipio = municipios.find(m => m.id === id);
    if (!municipio) return;

    const result = await Swal.fire({
      title: '¿Eliminar municipio?',
      text: `¿Está seguro de que desea eliminar el municipio "${municipio.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteMunicipio(id);
        await fetchMunicipios();
        
        Swal.fire({
          title: '¡Eliminado!',
          text: `El municipio "${municipio.nombre}" ha sido eliminado exitosamente.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error instanceof Error ? error.message : 'Error desconocido al eliminar el municipio',
          icon: 'error'
        });
      }
    }
  };

  const handleSubmit = async (data: Partial<Municipio>) => {
    try {
      if (editingMunicipio) {
        await updateMunicipio(editingMunicipio.id, data);
        addToast({
          title: 'Municipio actualizado',
          description: `El municipio "${data.nombre}" ha sido actualizado exitosamente.`,
          color: 'success'
        });
      } else {
        await createMunicipio(data);
        addToast({
          title: 'Municipio creado',
          description: `El municipio "${data.nombre}" ha sido creado exitosamente.`,
          color: 'success'
        });
      }
      
      await fetchMunicipios();
      setIsFormOpen(false);
      setEditingMunicipio(null);
    } catch (error) {
      addToast({
        title: editingMunicipio ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingMunicipio(null);
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
      onClick: (municipio: Municipio) => handleDelete(municipio.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los municipios
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
            Gestión de Municipios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los municipios del sistema
          </p>
        </div>
      </div>

      {/* Card de navegación a Centros */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Gestión de Centros
            </h3>
            <p className="text-green-100 mb-4">
              Los centros están asociados a municipios. Administra los centros de formación
            </p>
            <button
              onClick={() => navigate("/centros")}
              className="inline-flex items-center px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200 font-medium"
            >
              <Settings className="w-4 h-4 mr-2" />
              Gestionar Centros
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          <div className="hidden md:block">
            <MapPin className="w-16 h-16 text-green-200" />
          </div>
        </div>
      </div>

      <DataTable
        data={municipios}
        columns={columns}
        title="Municipios"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(municipio) => municipio.id}
        searchPlaceholder="Buscar municipios..."
        emptyMessage="No se encontraron municipios"
        createButtonLabel="Nuevo Municipio"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingMunicipio || { nombre: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default MunicipioPage;