import React, { useState } from "react";
import { addToast } from "@heroui/react";
import { Edit, Trash2, ExternalLink, Package, Tag, Ruler, Link2, Hash, FileText, Archive, Calendar, CheckCircle, XCircle, Package2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
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
import { StockManagementModal } from "../components/organisms/StockManagementModal";

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
  const { sitios, fetchSitios } = useSitio();
  const navigate = useNavigate();
  const { materiales, error, createMaterial, updateMaterial, deleteMaterial, fetchMateriales } =
    useMaterial();

  const { tiposMaterial, fetchTiposMaterial } = useTipoMaterial();
  const { categoriasMaterial, fetchCategoriasMaterial } =
    useCategoriaMaterial();
  const { unidadesMedida, fetchUnidadesMedida } = useUnidadMedida();

  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedMaterialForStock, setSelectedMaterialForStock] = useState<Material | null>(null);

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
      cell: (row: Material) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{row.id}</span>
        </div>
      ),
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      sortable: true,
      cell: (row: Material) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-green-500" />
          <span className="font-medium">{row.nombre}</span>
        </div>
      ),
    },
    {
      accessorKey: "esOriginal",
      header: "Tipo",
      sortable: true,
      width: "120px",
      cell: (row: Material) => {
        const esOriginal = row.esOriginal !== false;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              esOriginal
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            }`}
          >
            {esOriginal ? (
              <>
                <Package className="h-3 w-3" />
                Original
              </>
            ) : (
              <>
                <Link2 className="h-3 w-3" />
                Prestado
              </>
            )}
          </span>
        );
      },
    },
    {
      accessorKey: "sitio",
      header: "Sitio",
      sortable: false,
      cell: (row: Material) => (
        <div className="flex items-center gap-2">
          <Archive className="h-4 w-4 text-purple-500" />
          <span>{row.sitio?.nombre || "Sin sitio"}</span>
        </div>
      ),
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      sortable: true,
      cell: (row: Material) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="truncate max-w-xs" title={row.descripcion}>{row.descripcion}</span>
        </div>
      ),
    },
    
    {
      accessorKey: "tipoMaterial",
      header: "Tipo",
      sortable: false,
      cell: (row: Material) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-indigo-500" />
          <span>{row.tipoMaterial?.tipo || "Sin tipo"}</span>
        </div>
      ),
    },
    {
      accessorKey: "categoriaMaterial",
      header: "Categoría",
      sortable: false,
      cell: (row: Material) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-pink-500" />
          <span>{row.categoriaMaterial?.categoria || "Sin categoría"}</span>
        </div>
      ),
    },
    {
      accessorKey: "caduca",
      header: "Caduca",
      sortable: true,
      cell: (row: Material) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            row.caduca
              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}
        >
          {row.caduca ? (
            <>
              <Calendar className="h-3 w-3" />
              Sí
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              No
            </>
          )}
        </span>
      ),
    },
    {
      accessorKey: "unidadMedida",
      header: "Unidad de Medida",
      sortable: false,
      cell: (row: Material) => (
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-orange-500" />
          <span>{row.unidadMedida?.unidad || "Sin unidad"}</span>
        </div>
      ),
    },
    {
      accessorKey: "fechaVencimiento",
      header: "Fecha Vencimiento",
      sortable: true,
      isDate: true,
      cell: (row: Material) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-red-500" />
          <span>
            {row.fechaVencimiento
              ? new Date(row.fechaVencimiento).toLocaleDateString("es-ES")
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "activo",
      header: "Estado",
      sortable: true,
      cell: (row: Material) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            row.activo
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {row.activo ? (
            <>
              <CheckCircle className="h-3 w-3" />
              Activo
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              Inactivo
            </>
          )}
        </span>
      ),
    },
    {
      accessorKey: "fechaCreacion",
      header: "Fecha Creación",
      sortable: true,
      isDate: true,
      cell: (row: Material) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>{new Date(row.fechaCreacion).toLocaleDateString("es-ES")}</span>
        </div>
      ),
    },
    {
      accessorKey: "fechaActualizacion",
      header: "Última Actualización",
      sortable: true,
      isDate: true,
      cell: (row: Material) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-green-500" />
          <span>
            {row.fechaActualizacion
              ? new Date(row.fechaActualizacion).toLocaleDateString("es-ES")
              : "N/A"}
          </span>
        </div>
      ),
    },
  ];

  const formFields: FieldDefinition<Material>[] = [
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
    // ❌ ELIMINADO: Campo stock obsoleto
    // {
    //   name: "stock",
    //   label: "Stock",
    //   type: "number",
    //   required: true,
    // },
    {
      name: "unidadMedidaId",
      label: "Unidad de Medida",
      type: "select",
      required: false,
      options: unidadesMedida.map((unidad) => ({
        value: unidad.id,
        label: unidad.unidad,
      })),
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
  const handleManageStock = (material: Material) => {
  setSelectedMaterialForStock(material);
  setIsStockModalOpen(true);
};

const handleCloseStockModal = () => {
  setIsStockModalOpen(false);
  setSelectedMaterialForStock(null);
};

const handleStockUpdated = async () => {
  // Recargar la lista de materiales para actualizar el stock total
  await fetchMateriales();
};

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

    const result = await Swal.fire({
      title: '¿Eliminar material?',
      text: `¿Está seguro de que desea eliminar el material "${material.nombre}"? Esta acción no se puede deshacer.`,
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
        await deleteMaterial(id);
        await fetchMateriales();
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
        const { activo, ...payload } = data;
        await createMaterial(payload);
        addToast({
          title: "Material creado",
          description: `El material "${data.nombre}" ha sido creado exitosamente.`,
          color: "success",
        });
      }
      await fetchMateriales();
      await fetchSitios();
      await fetchTiposMaterial();
      await fetchCategoriasMaterial();
      await fetchUnidadesMedida();
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
    label: "Gestionar Stock",
    icon: <Package2 size={16} />,
    onClick: handleManageStock,
    variant: "secondary" as const,
  },
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
              caduca: false,
              activo: true,
            }
          }
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {selectedMaterialForStock && (
        <StockManagementModal
          isOpen={isStockModalOpen}
          onClose={handleCloseStockModal}
          material={selectedMaterialForStock} // Cambio: pasar el objeto Material completo
          onStockUpdated={handleStockUpdated}
        />
      )}
    </div>
  );
};

export default MaterialPage;
