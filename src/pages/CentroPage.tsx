import React, { useState, useEffect } from "react";
import { addToast } from "@heroui/react";
import { Settings, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../components/molecules/DataTable";
import {
  GenericForm,
  FieldDefinition,
} from "../components/molecules/GenericForm";
import { useCentro } from "../hooks/useCentro";
import { useMunicipio } from "../hooks/useMunicipio";
import { Centro } from "../types/centro.types";

interface Column<T> {
  accessorKey: keyof T;
  header: string;
  sortable?: boolean;
  isDate?: boolean;
  cell?: (row: T) => React.ReactNode;
}

const CentroPage: React.FC = () => {
  const navigate = useNavigate();
  const { centros, loading, error, createCentro, updateCentro, deleteCentro } =
    useCentro();

  const { municipios } = useMunicipio();


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCentro, setEditingCentro] = useState<Centro | null>(null);
  const [formData, setFormData] = useState<Partial<Centro>>({});

  useEffect(() => {}, []);

  const resetForm = () => {
    setFormData({});
    setEditingCentro(null);
    setIsFormOpen(false);
  };

  const handleCreate = () => {
    setFormData({ activo: true });
    setEditingCentro(null);
    setIsFormOpen(true);
  };

  const handleEdit = (centro: Centro) => {
    setFormData({
      nombre: centro.nombre,
      municipioId: centro.municipioId,
      activo: centro.activo,
    });
    setEditingCentro(centro);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Partial<Centro>) => {
    try {
      const processedData = {
        ...data,
        municipioId: data.municipioId ? Number(data.municipioId) : undefined,
      };

      if (editingCentro) {
        await updateCentro(editingCentro.id, processedData);
        addToast({
          title: "Éxito",
          description: "Centro actualizado correctamente",
          color: "success",
        });
      } else {
        await createCentro(processedData);
        addToast({
          title: "Éxito",
          description: "Centro creado correctamente",
          color: "success",
        });
      }
      resetForm();
    } catch (error) {
      addToast({
        title: "Error",
        description: editingCentro
          ? "Error al actualizar el centro"
          : "Error al crear el centro",
        color: "danger",
      });
    }
  };

  const columns: Column<Centro>[] = [
    {
      accessorKey: "id",
      header: "ID",
      sortable: true,
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      sortable: true,
    },
    {
      accessorKey: "municipio",
      header: "Municipio",
      sortable: false,
      cell: (row: Centro) =>(
        <div className="flex items-center gap-2">

          <span className="font-medium">{row.municipio?.nombre || 'Sin municipio'}</span>
        </div>
      )
    },
    {
      accessorKey: "sedes",
      header: "Sedes",
      sortable: false,
      cell: (row: Centro) => {
        if (row.sedes && row.sedes.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {row.sedes.map((sede) => (
                <span key={sede.id} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                  {sede.nombre}
                </span>
              ))}
            </div>
          );
        }
        return <span className="text-gray-500">Sin sedes</span>;
      }
    },
    {
      accessorKey: "activo",
      header: "Estado",
      sortable: true,
      cell: (row: Centro) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.activo
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {row.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      accessorKey: "fechaCreacion",
      header: "Fecha de Creación",
      sortable: true,
      isDate: true,
      cell: (row: Centro) =>
        new Date(row.fechaCreacion).toLocaleDateString("es-ES"),
    },
    {
      accessorKey: "fechaActualizacion",
      header: "Última Actualización",
      sortable: true,
      isDate: true,
      cell: (row: Centro) =>
        row.fechaActualizacion
          ? new Date(row.fechaActualizacion).toLocaleDateString("es-ES")
          : "N/A",
    },
  ];

  const formFields= [
    {
      name: 'nombre',
      label: 'Nombre del Centro',
      type: 'text',
      required: true,
      placeholder: 'Ingrese el nombre del centro'
    },
    {
      name: 'municipioId',
      label: 'Municipio',
      type: 'select',
      required: true,
      options: municipios.map(municipio => ({
        value: municipio.id,
        label: municipio.nombre
      })),
      placeholder: 'Seleccione un municipio'
    }
  ];

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este centro?")) {
      try {
        await deleteCentro(id);
        addToast({
          title: "Éxito",
          description: "Centro eliminado correctamente",
          color: "success",
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "Error al eliminar el centro",
          color: "danger",
        });
      }
    }
  };

  const handleCancel = () => {
    resetForm();
  };

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
    <div className=" space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Centros
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los centros de formación
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Gestión de Área-Centro
            </h3>
            <p className="text-purple-100 mb-4">
              Administra las relaciones entre centros y áreas del sistema
            </p>
            <button
              onClick={() => navigate("/areacentros")}
              className="inline-flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200 font-medium"
            >
              <Settings className="w-4 h-4 mr-2" />
              Gestionar Área-Centro
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          <div className="hidden md:block">
            <Settings className="w-16 h-16 text-purple-200" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-600 dark:text-gray-400">
            Cargando centros...
          </div>
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

      {isFormOpen && (
        <GenericForm<Centro>
          fields={formFields as FieldDefinition<Centro>[]}
          initialValues={formData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default CentroPage;
