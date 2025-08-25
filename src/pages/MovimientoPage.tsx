import React, { useState, useEffect } from "react";
import { DataTable } from "../components/molecules/DataTable";
import {
  GenericForm,
  FieldDefinition,
} from "../components/molecules/GenericForm";
import { useMovimiento } from "../hooks/useMovimiento";
import { useTipoMovimiento } from "../hooks/useTipoMovimiento";
import { usePersona } from "../hooks/usePersona";
import { useMaterial } from "../hooks/useMaterial";
import { useSolicitud } from "../hooks/useSolicitud";
import { useDetalles } from "../hooks/useDetalles";
import { Movimiento } from "../types/movimiento.types";
import { addToast, Card, CardBody } from "@heroui/react";
import { ArrowUp, ArrowDown, Package, RotateCcw } from "lucide-react";
import { useSitio } from "@/hooks/useSitio";

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

type TipoMovimientoSeleccionado = 'peticion' | 'devolver' | null;

const MovimientoPage: React.FC = () => {
  const { sitios } = useSitio();
  const {
    movimientos,
    loading,
    error,
    fetchMovimientos,
    createMovimientoConSolicitud,
  } = useMovimiento();

  const { tiposMovimiento } = useTipoMovimiento();
  const { personas } = usePersona();
  const { materiales } = useMaterial();
  const { solicitudes, createSolicitud } = useSolicitud();
  const { createDetalle } = useDetalles();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState<Movimiento | null>(
    null
  );
  const [tipoMovimientoSeleccionado, setTipoMovimientoSeleccionado] = useState<TipoMovimientoSeleccionado>(null);

  const crearEtiquetaMaterial = (material: any) => {
    const sitioInfo = material.sitio ? ` (${material.sitio.nombre})` : '';
    const stockInfo = ` - Stock: ${material.stock}`;
    const tipoInfo = material.esOriginal === false ? ' [PRESTADO]' : '';
    return `${material.nombre}${sitioInfo}${stockInfo}${tipoInfo}`;
  };

  // Función para deduplicar materiales por ID
  const deduplicarMateriales = (materiales: any[]) => {
    const materialesUnicos = new Map();
    materiales.forEach(material => {
      if (!materialesUnicos.has(material.id)) {
        materialesUnicos.set(material.id, material);
      }
    });
    return Array.from(materialesUnicos.values());
  };

  // Materiales deduplicados
  const materialesUnicos = deduplicarMateriales(materiales);

  // Filtrar materiales según el tipo de movimiento seleccionado
  const getMaterialesFiltrados = () => {
    if (tipoMovimientoSeleccionado === 'peticion') {
      // Para peticiones: mostrar solo materiales originales (esOriginal = true o undefined)
      return materialesUnicos.filter(material => material.esOriginal !== false && material.stock > 0);
    } else if (tipoMovimientoSeleccionado === 'devolver') {
      // Para devoluciones: mostrar solo materiales prestados (esOriginal = false)
      return materialesUnicos.filter(material => material.esOriginal === false);
    }
    return materialesUnicos;
  };

  // Obtener el tipo de movimiento ID según la selección
  const getTipoMovimientoId = () => {
    if (tipoMovimientoSeleccionado === 'peticion') {
      // Buscar tipo de movimiento de "salida" o "petición"
      const tipoSalida = tiposMovimiento.find(tipo => 
        tipo.nombre.toLowerCase().includes('salida') || 
        tipo.nombre.toLowerCase().includes('peticion')
      );
      return tipoSalida?.id;
    } else if (tipoMovimientoSeleccionado === 'devolver') {
      // Buscar tipo de movimiento de "entrada" o "devolución"
      const tipoEntrada = tiposMovimiento.find(tipo => 
        tipo.nombre.toLowerCase().includes('entrada') || 
        tipo.nombre.toLowerCase().includes('devolucion')
      );
      return tipoEntrada?.id;
    }
    return undefined;
  };

  const solicitudesPendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === "PENDIENTE"
  );

  const columns: Column<Movimiento>[] = [
    {
      accessorKey: "id",
      header: "ID",
      sortable: true,
      width: "80px",
    },
    {
      accessorKey: "tipoMovimiento",
      header: "Tipo",
      sortable: true,
      cell: (row: Movimiento) => (
        <div className="flex items-center gap-2">
          {row.tipoMovimiento?.nombre?.toLowerCase().includes("entrada") ? (
            <ArrowDown className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowUp className="h-4 w-4 text-red-600" />
          )}
          <span className="font-medium">
            {row.tipoMovimiento?.nombre || "Sin tipo"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "material",
      header: "Material",
      sortable: true,
      cell: (row: Movimiento) => (
        <span className="text-sm text-gray-600">
          {row.material?.nombre || "Sin material"}
        </span>
      ),
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      sortable: true,
    },
     {
      accessorKey: "sitio",
      header: "Sitio",
      sortable: false,
      cell: (row: Movimiento) => row.sitio?.nombre || "Sin sitio",
    },
    {
      accessorKey: "cantidad",
      header: "Cantidad",
      sortable: true,
      cell: (row: Movimiento) => (
        <span className="font-semibold text-blue-600">{row.cantidad}</span>
      ),
    },
    {
      accessorKey: "persona",
      header: "Solicitante",
      sortable: true,
      cell: (row: Movimiento) => (
        <span className="text-sm text-gray-600">
          {row.solicitud?.solicitante
            ? `${row.solicitud.solicitante.nombre} ${row.solicitud.solicitante.apellido || ""}`
            : "Sin solicitante"}
        </span>
      ),
    },
    {
      accessorKey: "solicitud",
      header: "Solicitud",
      sortable: true,
      cell: (row: Movimiento) => (
        <span className="text-sm text-gray-600">
          {row.solicitud?.descripcion || "Sin solicitud"}
        </span>
      ),
    },
    {
      accessorKey: "activo",
      header: "Estado",
      sortable: true,
      cell: (row: Movimiento) => (
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
      width: "150px",
    },
  ];

  const formFields: FieldDefinition<Movimiento>[] = [
    {
      name: "materialId",
      label: "Material",
      type: "select",
      required: true,
      options: getMaterialesFiltrados().map((material) => ({
        value: material.id,
        label: crearEtiquetaMaterial(material),
      })),
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "text",
      required: true,
    },
    // Solo mostrar sitio destino para peticiones
    ...(tipoMovimientoSeleccionado === 'peticion' ? [{
      name: "sitioId" as keyof Movimiento,
      label: "Sitio Destino",
      type: "select" as const,
      required: false,
      options: sitios.map(sitio => ({
        value: sitio.id,
        label: sitio.nombre
      })),
    }] : []),
    {
      name: "cantidad",
      label: "Cantidad",
      type: "number",
      required: true,
    },
    {
      name: "personaId",
      label: tipoMovimientoSeleccionado === 'peticion' ? "Solicitante" : "Persona que devuelve",
      type: "select",
      required: true,
      options: personas.map((persona) => ({
        value: persona.id,
        label: `${persona.nombre} ${persona.apellido || ""}`,
      })),
    },
    // Solo mostrar solicitud para peticiones
    ...(tipoMovimientoSeleccionado === 'peticion' ? [{
      name: "solicitudId" as keyof Movimiento,
      label: "Solicitud (Opcional - Por defecto: Falta aprobar)",
      type: "select" as const,
      options: solicitudesPendientes.map((solicitud) => ({
        value: solicitud.id,
        label: `${solicitud.descripcion} - ${solicitud.solicitante?.nombre || "Sin solicitante"}`,
      })),
    }] : []),
  ];

  const handleTipoMovimientoSelect = (tipo: TipoMovimientoSeleccionado) => {
    setTipoMovimientoSeleccionado(tipo);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    // No hacer nada aquí, el usuario debe seleccionar un tipo primero
  };

  // Agregar useEffect para cargar datos iniciales
  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  const handleSubmit = async (data: Partial<Movimiento>) => {
    try {
      // Agregar el tipo de movimiento según la selección
      const tipoMovimientoId = getTipoMovimientoId();
      if (!tipoMovimientoId) {
        throw new Error("No se pudo determinar el tipo de movimiento");
      }

      let currentSolicitudId = data.solicitudId;
      if (!currentSolicitudId && tipoMovimientoSeleccionado === 'peticion') {
        if (!data.personaId) {
          throw new Error("Se requiere seleccionar un solicitante para crear la solicitud.");
        }
        const solicitante = personas.find(p => p.id === data.personaId);
        if (!solicitante) {
          throw new Error("No se encontró el solicitante seleccionado.");
        }
        const newSolicitudResponse = await createSolicitud({
          descripcion: data.descripcion || "Solicitud automática para movimiento",
          solicitante,
        });
        currentSolicitudId = newSolicitudResponse.id;
        addToast({
          title: "Solicitud creada",
          description: "Se creó una nueva solicitud para este movimiento.",
          color: "secondary",
        });
      }

      // Validar sitio destino solo para peticiones
      if (tipoMovimientoSeleccionado === 'peticion' && !data.sitioId) {
        throw new Error("Se requiere seleccionar un sitio destino para las peticiones.");
      }

      const movementData = { 
        ...data, 
        tipoMovimientoId,
        solicitudId: currentSolicitudId 
      };
      
      await createMovimientoConSolicitud(movementData);
      await fetchMovimientos();
      addToast({
        title: "Movimiento creado",
        description: `${tipoMovimientoSeleccionado === 'peticion' ? 'Petición' : 'Devolución'} creada exitosamente.`,
        color: "success",
      });
      
      setIsFormOpen(false);
      setTipoMovimientoSeleccionado(null);
      setEditingMovimiento(null);
    } catch (error) {
      addToast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al procesar movimiento",
        color: "danger",
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setTipoMovimientoSeleccionado(null);
    setEditingMovimiento(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Cargando movimientos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Movimientos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los movimientos de los materiales del sistema
          </p>
        </div>
      </div>

      {/* Boxes para seleccionar tipo de movimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card 
          isPressable
          onPress={() => handleTipoMovimientoSelect('peticion')}
          className="hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-blue-500"
        >
          <CardBody className="text-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Petición
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Solicitar materiales del inventario
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card 
          isPressable
          onPress={() => handleTipoMovimientoSelect('devolver')}
          className="hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-green-500"
        >
          <CardBody className="text-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                <RotateCcw className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Devolver
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Devolver materiales prestados
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <DataTable
        data={movimientos}
        columns={columns}
        onCreate={handleCreate}
        getRowId={(movimiento) => movimiento.id}
        title="Lista de Movimientos"
        searchPlaceholder="Buscar movimientos..."
        emptyMessage="No se encontraron movimientos"
        createButtonLabel="Selecciona un tipo de movimiento arriba"
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      />

      {isFormOpen && tipoMovimientoSeleccionado && (
        <GenericForm
          fields={formFields}
          initialValues={{ cantidad: 0, activo: true }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default MovimientoPage;
