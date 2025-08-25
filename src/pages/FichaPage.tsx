import { useState } from "react";
import { DataTable } from "@/components/molecules/DataTable";
import { GenericForm, FieldDefinition } from "@/components/molecules/GenericForm";
import { useFicha } from "@/hooks/useFicha";
import { Ficha } from "@/types/ficha.types";
import { Edit, Trash,  Users, Calendar, CheckCircle, XCircle, Hash, ExternalLink, GraduationCap } from "lucide-react";
import { addToast } from "@heroui/react";
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";

export default function FichaPage() {
  const {
    fichas,
    loading,
    error,
    createFicha,
    updateFicha,
    deleteFicha,
  } = useFicha();
  
  const [showForm, setShowForm] = useState(false);
  const [editingFicha, setEditingFicha] = useState<Ficha | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const formFields: FieldDefinition<Ficha>[] = [
    {
      name: "numero",
      label: "Número de Ficha",
      type: "number",
      required: true,
    },
    {
      name: "cantidadAprendices",
      label: "Cantidad de Aprendices",
      type: "number",
    },
    {
      name: "activo",
      label: "Activo",
      type: "checkbox",
    },
  ];

  // Definición de columnas para la tabla con iconos
  const columns = [
    {
      accessorKey: "numero" as keyof Ficha,
      header: "Número",
      sortable: true,
      cell: (row: Ficha) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.numero}</span>
        </div>
      ),
    },
    {
      accessorKey: "cantidadAprendices" as keyof Ficha,
      header: "Cantidad Aprendices",
      sortable: true,
      cell: (row: Ficha) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-green-500" />
          <span>{row.cantidadAprendices || "No especificado"}</span>
        </div>
      ),
    },
    {
      accessorKey: "activo" as keyof Ficha,
      header: "Estado",
      cell: (row: Ficha) => (
        <div className="flex items-center gap-2">
          {row.activo ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.activo
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {row.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "fechaCreacion" as keyof Ficha,
      header: "Fecha Creación",
      isDate: true,
      cell: (row: Ficha) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <span>{new Date(row.fechaCreacion).toLocaleDateString()}</span>
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: "Editar",
      icon: <Edit size={16} />,
      onClick: (row: Ficha) => handleEdit(row),
      variant: "primary" as const,
    },
    {
      label: "Eliminar",
      icon: <Trash size={16} />,
      onClick: (row: Ficha) => handleDelete(row.id),
      variant: "danger" as const,
      show: (row: Ficha) => row.activo, 
    },
  ];

  const handleCreate = () => {
    setEditingFicha(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (ficha: Ficha) => {
    setEditingFicha(ficha);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const ficha = fichas.find(f => f.id === id);
    const result = await Swal.fire({
      title: '¿Eliminar Ficha?',
      text: `¿Está seguro de que desea eliminar la ficha ${ficha?.numero}? Esta acción no se puede deshacer.`,
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
        await deleteFicha(id);
        addToast({
          title: "Ficha eliminada",
          description: `La ficha ${ficha?.numero} se ha eliminado exitosamente`,
          color: "success",
        });
        
        await Swal.fire({
          title: '¡Eliminada!',
          text: 'La ficha ha sido eliminada correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        addToast({
          title: "Error al eliminar",
          description: "No se pudo eliminar la ficha",
          color: "danger",
        });
        
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la ficha. Inténtelo nuevamente.',
          icon: 'error'
        });
      }
    }
  };

  const handleFormSubmit = async (values: Partial<Ficha>) => {
    try {
      if (isEditing && editingFicha) {
        await updateFicha(editingFicha.id, values);
        addToast({
          title: "Ficha actualizada",
          description: "Los datos de la ficha se han actualizado correctamente",
          color: "success",
        });
      } else {
        await createFicha({
          ...values,
          activo: values.activo ?? true,
          fechaCreacion: new Date(),
        });
        addToast({
          title: "Ficha creada",
          description: "La nueva ficha se ha registrado exitosamente",
          color: "success",
        });
      }
      setShowForm(false);
      setEditingFicha(null);
      setIsEditing(false);
      
      // Mecanismo de refresh mejorado
      setTimeout(() => {
        // El hook useFicha debería refrescar automáticamente los datos
      }, 100);
    } catch (error) {
      addToast({
        title: `Error al ${isEditing ? "actualizar" : "crear"} ficha`,
        description: "Ha ocurrido un error. Por favor, inténtelo nuevamente.",
        color: "danger",
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingFicha(null);
    setIsEditing(false);
  };

  const getInitialValues = (): Partial<Ficha> => {
    if (isEditing && editingFicha) {
      return {
        numero: editingFicha.numero,
        cantidadAprendices: editingFicha.cantidadAprendices,
        activo: editingFicha.activo,
      };
    }
    return {
      activo: true,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Cargando fichas...</div>
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
    <div className=" space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Fichas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra las fichas de formación
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta de navegación a Titulados */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Gestión de Titulados</h3>
            <p className="text-blue-100 mb-4">
              Administra los titulados asociados a las fichas
            </p>
            <Link
              to="/titulados"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Gestionar Titulados
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <div className="hidden md:block">
            <GraduationCap className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      <DataTable
        data={fichas}
        columns={columns}
        actions={actions}
        onCreate={handleCreate}
        getRowId={(row) => row.id}
        title="Lista de Fichas"
        searchPlaceholder="Buscar por número de ficha..."
        emptyMessage="No se encontraron fichas"
        createButtonLabel="Nueva Ficha"
        className="mb-6"
      />

      {showForm && (
        <GenericForm
          fields={formFields}
          initialValues={getInitialValues()}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}