import React, { useState } from 'react';
import { DataTable } from '../components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '../components/molecules/GenericForm';
import { useSede } from '../hooks/useSede';
import { Sede } from '../types/sede.types';
import { addToast } from '@heroui/react';
import { Edit, Trash2, Building, MapPin, Hash, Calendar, Clock, CheckCircle, XCircle, Settings, ExternalLink } from 'lucide-react';
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

const SedePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    sedes,
    error,
    createSede,
    updateSede,
    deleteSede,
    fetchSedes
  } = useSede();



  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSede, setEditingSede] = useState<Sede | null>(null);

  const columns: Column<Sede>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      sortable: true,
      width: '80px',
      cell: (row: Sede) => (
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
      cell: (row: Sede) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      )
    },
    {
      accessorKey: 'direccion',
      header: 'Dirección',
      sortable: true,
      cell: (row: Sede) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-500" />
          <span className="text-gray-600 dark:text-gray-400">{row.direccion}</span>
        </div>
      )
    },

    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Sede) => (
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
      cell: (row: Sede) => (
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
      cell: (row: Sede) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-500" />
          <span className="text-sm">
            {row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'}
          </span>
        </div>
      )
    }
  ];

  const formFields: FieldDefinition<Sede>[] = [
    {
      name: 'nombre',
      label: 'Nombre de la Sede',
      type: 'text',
      required: true
    },
    {
      name: 'direccion',
      label: 'Dirección',
      type: 'text',
      required: true
    },
    {
      name: 'activo',
      label: 'Estado Activo',
      type: 'checkbox',
      required: false
    }
  ];


  const handleCreate = () => {
    setEditingSede(null);
    setIsFormOpen(true);
  };


  const handleEdit = (sede: Sede) => {
    setEditingSede(sede);
    setIsFormOpen(true);
  };


  const handleDelete = async (id: number) => {
    const sede = sedes.find(s => s.id === id);
    if (!sede) return;

    const result = await Swal.fire({
      title: '¿Eliminar sede?',
      text: `¿Está seguro de que desea eliminar la sede "${sede.nombre}"? Esta acción no se puede deshacer.`,
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
        await deleteSede(id);
        await fetchSedes(); 
        
        Swal.fire({
          title: '¡Eliminado!',
          text: `La sede "${sede.nombre}" ha sido eliminada exitosamente.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error instanceof Error ? error.message : 'Error desconocido al eliminar la sede',
          icon: 'error'
        });
      }
    }
  };

  const handleSubmit = async (data: Partial<Sede>) => {
    try {
      if (editingSede) {
        await updateSede(editingSede.id, data);
        addToast({
          title: 'Sede actualizada',
          description: `La sede "${data.nombre}" ha sido actualizada exitosamente.`,
          color: 'success'
        });
      } else {
        await createSede(data);
        addToast({
          title: 'Sede creada',
          description: `La sede "${data.nombre}" ha sido creada exitosamente.`,
          color: 'success'
        });
      }
      
      await fetchSedes();
      setIsFormOpen(false);
      setEditingSede(null);
    } catch (error) {
      addToast({
        title: editingSede ? 'Error al actualizar' : 'Error al crear',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'danger'
      });
    }
  };


  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingSede(null);
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
      onClick: (sede: Sede) => handleDelete(sede.id),
      variant: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar las sedes
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
            Gestión de Sedes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las sedes del sistema
          </p>
        </div>
      </div>

      {/* Card de navegación a Centros */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Gestión de Centros
            </h3>
            <p className="text-blue-100 mb-4">
              Administra los centros de formación del sistema
            </p>
            <button
              onClick={() => navigate("/centros")}
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
            >
              <Settings className="w-4 h-4 mr-2" />
              Gestionar Centros
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          <div className="hidden md:block">
            <Building className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      <DataTable
        data={sedes}
        columns={columns}
        title="Sedes"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(sede) => sede.id}
        searchPlaceholder="Buscar sedes..."
        emptyMessage="No se encontraron sedes"
        createButtonLabel="Nueva Sede"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm<Sede>
          fields={formFields}
          initialValues={editingSede || { nombre: '', direccion: '', activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default SedePage;