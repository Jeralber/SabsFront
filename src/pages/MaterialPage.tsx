import React, { useState } from "react";
import { addToast } from "@heroui/react";
import { Edit, Trash2, ExternalLink, Package, Tag, Ruler } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Material } from "../types/material.types";

import { useMaterial } from "../hooks/useMaterial";
import { useTipoMaterial } from "../hooks/useTipoMaterial";
import { useCategoriaMaterial } from "../hooks/useCategoriaMaterial";
import { useUnidadMedida } from "../hooks/useUnidadMedida";
import { useSitio } from "../hooks/useSitio"; // Asegúrate de importar el hook para sitios

import { DataTable } from "../components/molecules/DataTable";
import {
  GenericForm,
  FieldDefinition,
} from "../components/molecules/GenericForm";

// Definir el tipo Column localmente
type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

const MaterialPage: React.FC = () => {
  const { sitios } = useSitio();
  const navigate = useNavigate();
  const { materiales, error, createMaterial, updateMaterial, deleteMaterial } =
    useMaterial();

  const { tiposMaterial, createTipoMaterial } = useTipoMaterial();
  const { categoriasMaterial, createCategoriaMaterial } =
    useCategoriaMaterial();
  const { unidadesMedida, createUnidadMedida } = useUnidadMedida();

  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Funciones de navegación
  const handleNavigateToTipoMaterial = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    navigate("/tipos-material");
  };

  const handleNavigateToCategoriaMaterial = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    navigate("/categorias-material");
  };

  const handleNavigateToUnidadMedida = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    navigate("/unidades-medida");
  };

  const columns: Column<Material>[] = [
    {
      accessorKey: "id",
      header: "ID",
      sortable: true,
    },
    {
      accessorKey: "codigo",
      header: "Código",
      sortable: true,
      width: "120px",
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      sortable: true,
    },
    {
      accessorKey: "sitio",
      header: "Sitio",
      sortable: false,
      cell: (row: Material) => row.sitio?.nombre || "Sin sitio",
    },

    {
      accessorKey: "descripcion",
      header: "Descripción",
      sortable: true,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      sortable: true,
      cell: (row: Material) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.stock > 10
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : row.stock > 0
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {row.stock}
        </span>
      ),
    },

    {
      accessorKey: "tipoMaterial",
      header: "Tipo",
      sortable: false,
      cell: (row: Material) => row.tipoMaterial?.tipo || "Sin tipo",
    },
    {
      accessorKey: "categoriaMaterial",
      header: "Categoría",
      sortable: false,
      cell: (row: Material) =>
        row.categoriaMaterial?.categoria || "Sin categoría",
    },

    {
      accessorKey: "caduca",
      header: "Caduca",
      sortable: true,
      cell: (row: Material) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.caduca
              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}
        >
          {row.caduca ? "Sí" : "No"}
        </span>
      ),
    },
    {
      accessorKey: "unidadMedida",
      header: "Unidad de Medida",
      sortable: false,
      cell: (row: Material) => row.unidadMedida?.unidad || "Sin unidad",
    },
    {
      accessorKey: "fechaVencimiento",
      header: "Fecha Vencimiento",
      sortable: true,
      isDate: true,
      cell: (row: Material) =>
        row.fechaVencimiento
          ? new Date(row.fechaVencimiento).toLocaleDateString("es-ES")
          : "N/A",
    },
    {
      accessorKey: "activo",
      header: "Estado",
      sortable: true,
      cell: (row: Material) => (
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
      header: "Fecha Creación",
      sortable: true,
      isDate: true,
      cell: (row: Material) =>
        new Date(row.fechaCreacion).toLocaleDateString("es-ES"),
    },
    {
      accessorKey: "fechaActualizacion",
      header: "Última Actualización",
      sortable: true,
      isDate: true,
      cell: (row: Material) =>
        row.fechaActualizacion
          ? new Date(row.fechaActualizacion).toLocaleDateString("es-ES")
          : "N/A",
    },
  ];

  const formFields: FieldDefinition<Material>[] = [
    {
      name: "codigo",
      label: "Código de Material",
      type: "text",
      required: true,
    },
    {
      name: "nombre",
      label: "Nombre del Material",
      type: "text",
      required: true,
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "text",
      required: true,
    },
    {
      name: "sitioId",
      label: "Sitio",
      type: "select",
      required: true,
      options: sitios.map(sitio => ({
        value: sitio.id,
        label: sitio.nombre
      })),
    },

    {
      name: "stock",
      label: "Stock",
      type: "number",
      required: true,
    },
    {
      name: "unidadMedidaId",
      label: "Unidad de Medida",
      type: "select",
      required: false,
      options: unidadesMedida.map((unidad) => ({
        value: unidad.id,
        label: unidad.unidad,
      })),
      allowQuickCreate: true,
      quickCreateTitle: "Crear Nueva Unidad de Medida",
      quickCreateFields: [
        {
          name: "unidad",
          label: "Unidad",
          type: "text",
          required: true,
        },
        {
          name: "activo",
          label: "Activo",
          type: "checkbox",
          required: false,
        },
      ],
      onQuickCreate: async (data) => {
        const response = await createUnidadMedida({
          ...data,
          activo: data.activo ?? true,
        });
        const newUnidad = response.data;
        if (!newUnidad || Array.isArray(newUnidad)) {
          throw new Error("Error al crear la unidad de medida");
        }
        return {
          id: newUnidad.id,
          label: newUnidad.unidad,
        };
      },
    },
    {
      name: "tipoMaterialId",
      label: "Tipo de Material",
      type: "select",
      required: false,
      options: tiposMaterial.map((tipo) => ({
        value: tipo.id,
        label: tipo.tipo,
      })),
      allowQuickCreate: true,
      quickCreateTitle: "Crear Nuevo Tipo de Material",
      quickCreateFields: [
        {
          name: "tipo",
          label: "Tipo",
          type: "text",
          required: true,
        },
        {
          name: "activo",
          label: "Activo",
          type: "checkbox",
          required: false,
        },
      ],
      onQuickCreate: async (data) => {
        const response = await createTipoMaterial({
          ...data,
          activo: data.activo ?? true,
        });
        const newTipo = response.data;
        if (!newTipo || Array.isArray(newTipo)) {
          throw new Error("Error al crear el tipo de material");
        }
        return {
          id: newTipo.id,
          label: newTipo.tipo,
        };
      },
    },
    {
      name: "categoriaMaterialId",
      label: "Categoría de Material",
      type: "select",
      required: false,
      options: categoriasMaterial.map((categoria) => ({
        value: categoria.id,
        label: categoria.categoria,
      })),
      allowQuickCreate: true,
      quickCreateTitle: "Crear Nueva Categoría de Material",
      quickCreateFields: [
        {
          name: "categoria",
          label: "Categoría",
          type: "text",
          required: true,
        },
        {
          name: "activo",
          label: "Activo",
          type: "checkbox",
          required: false,
        },
      ],
      onQuickCreate: async (data) => {
        const response = await createCategoriaMaterial({
          ...data,
          activo: data.activo ?? true,
        });
        const newCategoria = response.data;
        if (!newCategoria || Array.isArray(newCategoria)) {
          throw new Error("Error al crear la categoría de material");
        }
        return {
          id: newCategoria.id,
          label: newCategoria.categoria,
        };
      },
    },
    {
      name: "caduca",
      label: "El material caduca",
      type: "checkbox",
      required: false,
    },
    {
      name: "fechaVencimiento",
      label: "Fecha de Vencimiento",
      type: "date",
      required: false,
    },
    {
      name: "activo",
      label: "Estado Activo",
      type: "checkbox",
      required: false,
    },
  ];

  const handleCreate = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const material = materiales.find((m) => m.id === id);
    if (!material) return;

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el material "${material.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteMaterial(id);
        addToast({
          title: "Material eliminado",
          description: `El material "${material.nombre}" ha sido eliminado exitosamente.`,
          color: "success",
        });
      } catch (error) {
        addToast({
          title: "Error al eliminar",
          description:
            error instanceof Error
              ? error.message
              : "Error desconocido al eliminar el material",
          color: "danger",
        });
      }
    }
  };

  const handleSubmit = async (data: Partial<Material>) => {
    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, data);
        addToast({
          title: "Material actualizado",
          description: `El material "${data.nombre}" ha sido actualizado exitosamente.`,
          color: "success",
        });
      } else {
        await createMaterial(data);
        addToast({
          title: "Material creado",
          description: `El material "${data.nombre}" ha sido creado exitosamente.`,
          color: "success",
        });
      }
      setIsFormOpen(false);
      setEditingMaterial(null);
    } catch (error) {
      addToast({
        title: editingMaterial ? "Error al actualizar" : "Error al crear",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        color: "danger",
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingMaterial(null);
  };

  const actions = [
    {
      label: "Editar",
      icon: <Edit size={16} />,
      onClick: handleEdit,
      variant: "primary" as const,
    },
    {
      label: "Eliminar",
      icon: <Trash2 size={16} />,
      onClick: (material: Material) => handleDelete(material.id),
      variant: "danger" as const,
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los materiales
          </div>
          <div className="text-gray-600 dark:text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Materiales
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra el inventario de materiales del sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Tipos de Material</h3>
              <p className="text-blue-100 mb-4">
                Gestiona los tipos de material disponibles
              </p>
              <button
                onClick={handleNavigateToTipoMaterial}
                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
              >
                <Package className="w-4 h-4 mr-2" />
                Gestionar Tipos
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>
            <div className="hidden md:block">
              <Package className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Categorías de Material
              </h3>
              <p className="text-purple-100 mb-4">
                Administra las categorías de materiales
              </p>
              <button
                onClick={handleNavigateToCategoriaMaterial}
                className="inline-flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200 font-medium"
              >
                <Tag className="w-4 h-4 mr-2" />
                Gestionar Categorías
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>
            <div className="hidden md:block">
              <Tag className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Unidades de Medida</h3>
              <p className="text-orange-100 mb-4">
                Configura las unidades de medida
              </p>
              <button
                onClick={handleNavigateToUnidadMedida}
                className="inline-flex items-center px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors duration-200 font-medium"
              >
                <Ruler className="w-4 h-4 mr-2" />
                Gestionar Unidades
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>
            <div className="hidden md:block">
              <Ruler className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={materiales}
        columns={columns}
        title="Materiales"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(material) => material.id}
        searchPlaceholder="Buscar materiales..."
        emptyMessage="No se encontraron materiales"
        createButtonLabel="Nuevo Material"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm<Material>
          fields={formFields}
          initialValues={
            editingMaterial || {
              nombre: "",
              descripcion: "",
              stock: 0,
              caduca: false,
              activo: true,
            }
          }
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default MaterialPage;
