import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/molecules/DataTable';
import { GenericForm, FieldDefinition } from '@/components/molecules/GenericForm';
import { useDetalles } from '@/hooks/useDetalles';
import { useMaterial } from '@/hooks/useMaterial';
import { usePersona } from '@/hooks/usePersona';
import { useSolicitud } from '@/hooks/useSolicitud';
import { Detalles } from '@/types/detalles.types';
import { CreateDetallesDto } from '@/services/detallesService'; // Agregar este import
import { Package, FileText, User, Calendar } from 'lucide-react';

const DetallesPage: React.FC = () => {
  const {
    detalles,
    loading,
    error,
    fetchDetalles,
    createDetalle,
    updateDetalle,
    deleteDetalle,
    aprobarDetalle,
    rechazarDetalle
  } = useDetalles();
  
  const { materiales, fetchMateriales } = useMaterial();
  const { personas, fetchPersonas } = usePersona();
  const { solicitudes, fetchSolicitudes } = useSolicitud();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDetalle, setEditingDetalle] = useState<Detalles | null>(null);

  useEffect(() => {
    fetchDetalles();
    fetchMateriales();
    fetchPersonas();
    fetchSolicitudes();
  }, []);

  const columns = [
    {
      accessorKey: "id" as keyof Detalles,
      header: "ID",
      sortable: true,
      width: "80px",
    },
    {
      accessorKey: "materialId" as keyof Detalles, // Cambiar de "material" a "materialId"
      header: "Material",
      sortable: true,
      cell: (row: Detalles) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          <div>
            <span className="font-medium">{row.material?.nombre || "Sin material"}</span>
            <p className="text-xs text-gray-500">{row.material?.codigo}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "cantidad" as keyof Detalles,
      header: "Cantidad",
      sortable: true,
      cell: (row: Detalles) => (
        <span className="font-semibold text-blue-600">{row.cantidad}</span>
      ),
    },
    {
      accessorKey: "accion" as keyof Detalles,
      header: "Acción",
      sortable: true,
      cell: (row: Detalles) => (
        <span className="text-sm text-gray-600">{row.accion || "Sin descripción"}</span>
      ),
    },
    {
      accessorKey: "numeroFactura" as keyof Detalles,
      header: "N° Factura",
      sortable: true,
      cell: (row: Detalles) => (
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 text-gray-400" />
          <span className="text-sm">{row.numeroFactura || "N/A"}</span>
        </div>
      ),
    },
    {
      accessorKey: "solicitanteId" as keyof Detalles, // Cambiar de "solicitante" a "solicitanteId"
      header: "Solicitante",
      sortable: true,
      cell: (row: Detalles) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-green-500" />
          <span className="text-sm">
            {row.solicitante 
              ? `${row.solicitante.nombre} ${row.solicitante.apellido || ""}` 
              : "Sin solicitante"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "estado" as keyof Detalles,
      header: "Estado",
      sortable: true,
      cell: (row: Detalles) => {
        const getStatusColor = (estado: string) => {
          switch (estado) {
            case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'APROBADO': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'RECHAZADO': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'ENTREGADO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'DEVUELTO': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
          }
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.estado)}`}>
            {row.estado}
          </span>
        );
      },
    },
    {
      accessorKey: "fechaCreacion" as keyof Detalles,
      header: "Fecha Creación",
      sortable: true,
      isDate: true,
      cell: (row: Detalles) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className="text-sm">
            {new Date(row.fechaCreacion).toLocaleDateString("es-ES")}
          </span>
        </div>
      ),
    },
  ];

  const formFields: FieldDefinition<Detalles>[] = [
    {
      name: "materialId",
      label: "Material",
      type: "select",
      required: true,
      options: materiales.map((material) => ({
        value: material.id,
        label: `${material.nombre} (${material.codigo})`,
      })),
    },
    {
      name: "cantidad",
      label: "Cantidad",
      type: "number",
      required: true,
    },
    {
      name: "accion",
      label: "Descripción de la Acción",
      type: "text",
      required: false,
    },
    {
      name: "numeroFactura",
      label: "Número de Factura",
      type: "text",
      required: false,
    },
    {
      name: "solicitanteId",
      label: "Solicitante",
      type: "select",
      required: false,
      options: personas.map((persona) => ({
        value: persona.id,
        label: `${persona.nombre} ${persona.apellido || ""}`,
      })),
    },
    {
      name: "solicitudId",
      label: "Solicitud",
      type: "select",
      required: true,
      options: solicitudes.map((solicitud) => ({
        value: solicitud.id,
        label: solicitud.descripcion,
      })),
    },
    {
      name: "estado",
      label: "Estado",
      type: "select",
      required: false,
      options: [
        { value: 'PENDIENTE', label: 'Pendiente' },
        { value: 'APROBADO', label: 'Aprobado' },
        { value: 'RECHAZADO', label: 'Rechazado' },
        { value: 'ENTREGADO', label: 'Entregado' },
        { value: 'DEVUELTO', label: 'Devuelto' },
      ],
    },
  ];

  const actions = [
    {
      label: "Aprobar",
      onClick: (detalle: Detalles) => handleAprobar(detalle.id),
      variant: "primary" as const,
      show: (detalle: Detalles) => detalle.estado === 'PENDIENTE',
    },
    {
      label: "Rechazar",
      onClick: (detalle: Detalles) => handleRechazar(detalle.id),
      variant: "danger" as const,
      show: (detalle: Detalles) => detalle.estado === 'PENDIENTE',
    },
  ];

  const handleCreate = () => {
    setEditingDetalle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (detalle: Detalles) => {
    setEditingDetalle(detalle);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDetalle(id);
      await fetchDetalles();
    } catch (error) {
      console.error('Error al eliminar detalle:', error);
    }
  };

  const handleSubmit = async (data: Partial<Detalles>) => {
    try {
      if (editingDetalle) {
        await updateDetalle(editingDetalle.id, data);
      } else {
        await createDetalle(data as CreateDetallesDto);
      }
      await fetchDetalles();
      setIsFormOpen(false);
      setEditingDetalle(null);
    } catch (error) {
      console.error('Error al guardar detalle:', error);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingDetalle(null);
  };

  const handleAprobar = async (id: number) => {
    try {
      // Aquí deberías obtener el ID de la persona que aprueba
      const personaApruebaId = 1; // Esto debería venir del contexto de autenticación
      await aprobarDetalle(id, personaApruebaId);
      await fetchDetalles();
    } catch (error) {
      console.error('Error al aprobar detalle:', error);
    }
  };

  const handleRechazar = async (id: number) => {
    try {
      const personaApruebaId = 1; // Esto debería venir del contexto de autenticación
      await rechazarDetalle(id, personaApruebaId);
      await fetchDetalles();
    } catch (error) {
      console.error('Error al rechazar detalle:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Detalles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los detalles de solicitudes con información completa
          </p>
        </div>
      </div>

      <DataTable
        data={detalles}
        columns={columns}
        title="Detalles de Solicitudes"
        actions={actions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={(detalle) => detalle.id}
        searchPlaceholder="Buscar detalles..."
        emptyMessage="No se encontraron detalles"
        createButtonLabel="Nuevo Detalle"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && (
        <GenericForm<Detalles>
          fields={formFields}
          initialValues={
            editingDetalle || {
              cantidad: 0,
              estado: 'PENDIENTE',
              materialId: 0,
              solicitudId: 0,
            }
          }
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default DetallesPage;