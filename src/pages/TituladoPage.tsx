import { useState } from 'react';
import { DataTable } from '@/components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '@/components/molecules/GenericForm';
import { useTitulado } from '@/hooks/useTitulado';
import { useArea } from '@/hooks/useArea';
import { useFicha } from '@/hooks/useFicha';
import { Titulado } from '@/types/titulado.types';
import { Edit, Trash, GraduationCap, MapPin, FileText, Calendar, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { addToast } from '@heroui/react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

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
      sortable: true,
      cell: (row: Titulado) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-gray-500">#{row.id}</span>
        </div>
      )
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
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-500" />
          <span className="text-gray-600 dark:text-gray-300">
            {row.area?.nombre || 'Sin área'}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'ficha',
      header: 'Ficha',
      sortable: true,
      cell: (row: Titulado) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-purple-500" />
          <span className="text-gray-600 dark:text-gray-300">
            {row.ficha ? `Ficha ${row.ficha.numero}` : 'Sin ficha'}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      sortable: true,
      cell: (row: Titulado) => (
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
      cell: (row: Titulado) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <span>{new Date(row.fechaCreacion).toLocaleDateString('es-ES')}</span>
        </div>
      )
    },
    {
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      sortable: true,
      isDate: true,
      cell: (row: Titulado) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-orange-500" />
          <span>
            {row.fechaActualizacion ? new Date(row.fechaActualizacion).toLocaleDateString('es-ES') : 'N/A'}
          </span>
        </div>
      )
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
    const titulado = titulados.find(t => t.id === id);
    const result = await Swal.fire({
      title: '¿Eliminar Titulado?',
      text: `¿Está seguro de que desea eliminar a ${titulado?.nombre}? Esta acción no se puede deshacer.`,
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
        await deleteTitulado(id);
        addToast({
          title: 'Éxito',
          description: `${titulado?.nombre} ha sido eliminado correctamente`,
          color: 'success'
        });
        
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El titulado ha sido eliminado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        addToast({
          title: 'Error',
          description: 'Error al eliminar el titulado',
          color: 'danger'
        });
        
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el titulado. Inténtelo nuevamente.',
          icon: 'error'
        });
      }
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
      
      // Mecanismo de refresh mejorado
      setTimeout(() => {
        // El hook useTitulado debería refrescar automáticamente los datos
      }, 100);
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
    
      {/* Card de navegación debajo del título */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Gestión de Áreas
            </h3>
            <p className="text-indigo-100 mb-4">
              Administra las áreas académicas del sistema
            </p>
            <Link
              to="/areas"
              className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-200 font-medium"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Gestionar Áreas
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <div className="hidden md:block">
            <GraduationCap className="w-16 h-16 text-indigo-200" />
          </div>
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