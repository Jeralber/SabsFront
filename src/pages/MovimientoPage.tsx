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
import { useDetalles } from "../hooks/useDetalles";
import { Movimiento, CreateMovimientoDto } from "../types/movimiento.types";
import { Detalles } from "../types/detalles.types";
import { addToast, Card, CardBody, Button } from "@heroui/react";
import {
  ArrowUp,
  ArrowDown,
  Package,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  Check,
  X,
} from "lucide-react";
import { useSitio } from "@/hooks/useSitio";
import { useAuth } from "@/context/AuthContext";

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

type TipoMovimientoSeleccionado = "peticion" | "devolver" | "prestamo" | null;

const MovimientoPage: React.FC = () => {
  const { sitios } = useSitio();
  const { user } = useAuth();

  const isAdmin = user?.usuario?.rol?.toLowerCase() === "administrador";

  const {
    movimientos,
    movimientosPendientes,
    loading,
    error,
    fetchMovimientos,
    fetchMovimientosPendientes,

    createMovimiento,
    aprobarMovimiento,
    rechazarMovimiento,
  } = useMovimiento();
  const { tiposMovimiento } = useTipoMovimiento();
  const { personas } = usePersona();
  const { materiales, fetchMateriales } = useMaterial();
  const { fetchDetallesPorMovimiento, loading: detallesLoading } =
    useDetalles();

  const [sitioDestinoAutomatico, setSitioDestinoAutomatico] = useState<
    number | null
  >(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] =
    useState<Movimiento | null>(null);
  const [movimientoDetalles] = useState<Detalles[]>([]);
  const [tipoMovimientoSeleccionado, setTipoMovimientoSeleccionado] =
    useState<TipoMovimientoSeleccionado>(null);
  const [mostrarSoloPendientes, setMostrarSoloPendientes] = useState(false);

  const crearEtiquetaMaterial = (material: any) => {
    const sitioInfo = material.sitio ? ` (${material.sitio.nombre})` : "";
    
    // ✅ NUEVA LÓGICA: Mostrar stock total de Stock entities o cantidadPrestada
    let stockInfo = "";
    if (material.esOriginal === false && material.cantidadPrestada) {
      stockInfo = ` - Prestado: ${material.cantidadPrestada}`;
    } else if (material.stocks && material.stocks.length > 0) {
      const stockTotal = material.stocks
        .filter((stock: any) => stock.activo)
        .reduce((total: number, stock: any) => total + stock.cantidad, 0);
      stockInfo = ` - Stock: ${stockTotal}`;
    } else {
      stockInfo = " - Sin stock asignado";
    }
    
    const tipoInfo = material.esOriginal === false ? " [PRESTADO]" : "";
    return `${material.nombre}${sitioInfo}${stockInfo}${tipoInfo}`;
  };
  const getSitioOrigenMaterial = (materialId: number): number | null => {
    const material = materiales.find((m) => m.id === materialId);
    if (!material || !material.materialOrigenId) return null;

    const materialOrigen = materiales.find(
      (m) => m.id === material.materialOrigenId
    );
    return materialOrigen?.sitioId || null;
  };

  const deduplicarMateriales = (materiales: any[]) => {
    const materialesUnicos = new Map();
    materiales.forEach((material) => {
      if (!materialesUnicos.has(material.id)) {
        materialesUnicos.set(material.id, material);
      }
    });
    return Array.from(materialesUnicos.values());
  };

  const materialesUnicos = deduplicarMateriales(materiales);

  const getMaterialesFiltrados = () => {
    if (tipoMovimientoSeleccionado === "peticion") {
      return materialesUnicos.filter(
        (material) => 
          material.esOriginal !== false && 
          material.stocks && 
          material.stocks.some((stock: any) => stock.activo && stock.cantidad > 0)
      );
    } else if (tipoMovimientoSeleccionado === "devolver") {
      return materialesUnicos.filter(
        (material) =>
          material.esOriginal === false &&
          material.cantidadPrestada > 0 && // ✅ Usar cantidadPrestada
          material.activo !== false
      );
    } else if (tipoMovimientoSeleccionado === "prestamo") {
      // Para préstamos, mostrar materiales originales con stock disponible
      return materialesUnicos.filter(
        (material) => 
          material.esOriginal !== false && 
          material.stocks && 
          material.stocks.some((stock: any) => stock.activo && stock.cantidad > 0) // ✅ Verificar Stock entities
      );
    }
    return materialesUnicos;
  };

  const getTipoMovimientoId = () => {
    if (tipoMovimientoSeleccionado === "peticion") {
      const tipoSalida = tiposMovimiento.find(
        (tipo) =>
          tipo.nombre.toLowerCase().includes("salida") ||
          tipo.nombre.toLowerCase().includes("peticion")
      );
      return tipoSalida?.id;
    } else if (tipoMovimientoSeleccionado === "devolver") {
      const tipoDevolucion = tiposMovimiento.find(
        (tipo) =>
          tipo.nombre.toLowerCase().includes("devolucion") ||
          tipo.nombre.toLowerCase().includes("devolución") ||
          tipo.nombre.toLowerCase().includes("entrada")
      );
      return tipoDevolucion?.id;
    } else if (tipoMovimientoSeleccionado === "prestamo") {
      const tipoPrestamo = tiposMovimiento.find((tipo) =>
        tipo.nombre.toLowerCase().includes("prestamo")
      );
      return tipoPrestamo?.id;
    }
    return undefined;
  };

  const handleVerDetalles = async (movimiento: Movimiento) => {
    setSelectedMovimiento(movimiento);
    try {
      await fetchDetallesPorMovimiento(movimiento.id);
      // Los detalles ahora están disponibles en el estado 'detalles' del hook
      // No necesitamos setMovimientoDetalles ya que los detalles se manejan por el hook
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudieron cargar los detalles del movimiento",
        color: "danger",
      });
    }
  };

  const handleAprobarMovimiento = async (movimientoId: number) => {
    try {
      const aprobadorId = 1;

      await aprobarMovimiento(movimientoId, aprobadorId);
      
      // ✅ CORRECCIÓN: Actualización múltiple para asegurar sincronización
      await fetchMovimientos();
      await fetchMateriales(); // Primera actualización inmediata
      
      if (mostrarSoloPendientes) {
        await fetchMovimientosPendientes();
      }
      
      // ✅ NUEVO: Segunda actualización con delay para cantidadPrestada
      setTimeout(async () => {
        await fetchMateriales();
      }, 1000);
      
      addToast({
        title: "Movimiento aprobado",
        description: "El movimiento ha sido aprobado exitosamente",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo aprobar el movimiento",
        color: "danger",
      });
    }
  };

  const handleRechazarMovimiento = async (movimientoId: number) => {
    try {
      // Obtener el ID del usuario actual (esto debería venir del contexto de autenticación)
      // Por ahora usamos un ID temporal - esto debe ser reemplazado por el ID real del usuario logueado
      const aprobadorId = 1; // TODO: Obtener del contexto de autenticación

      await rechazarMovimiento(movimientoId, aprobadorId);
      await fetchMovimientos();
      if (mostrarSoloPendientes) {
        await fetchMovimientosPendientes();
      }
      addToast({
        title: "Movimiento rechazado",
        description: "El movimiento ha sido rechazado",
        color: "warning",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo rechazar el movimiento",
        color: "danger",
      });
    }
  };

  const handleMostrarPendientes = async () => {
    if (!mostrarSoloPendientes) {
      await fetchMovimientosPendientes();
    } else {
      await fetchMovimientos();
    }
    setMostrarSoloPendientes(!mostrarSoloPendientes);
  };

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
      accessorKey: "sitioDestino",
      header: "Sitio Destino",
      sortable: false,
      cell: (row: Movimiento) => row.sitioDestino?.nombre || "Sin sitio",
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
      accessorKey: "solicitante",
      header: "Solicitante",
      sortable: true,
      cell: (row: Movimiento) => (
        <span className="text-sm text-gray-600">
          {row.solicitante
            ? `${row.solicitante.nombre} ${row.solicitante.apellido || ""}`
            : "Sin solicitante"}
        </span>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      sortable: true,
      cell: (row: Movimiento) => {
        const getEstadoColor = (estado: string) => {
          switch (estado) {
            case "APROBADO":
              return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "RECHAZADO":
              return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default:
              return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
          }
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(row.estado)}`}
          >
            {row.estado}
          </span>
        );
      },
    },
    {
      accessorKey: "fechaCreacion",
      header: "Fecha Creación",
      sortable: true,
      isDate: true,
      width: "150px",
    },
  ];

  // Agregar un estado para el material seleccionado
  const [materialSeleccionado] = useState<number | null>(null);

  // useEffect principal para manejar cambios en tipo de movimiento
  useEffect(() => {
    fetchMovimientos();
    if (tipoMovimientoSeleccionado === "devolver") {
      fetchMateriales(); // Refrescar materiales para mostrar solo los prestados
    }
  }, [fetchMovimientos, fetchMateriales, tipoMovimientoSeleccionado]);

  // useEffect para sitio destino automático en devoluciones
  useEffect(() => {
    if (tipoMovimientoSeleccionado === "devolver" && materialSeleccionado) {
      const sitioOrigen = getSitioOrigenMaterial(materialSeleccionado);
      setSitioDestinoAutomatico(sitioOrigen);
    }
  }, [materialSeleccionado, tipoMovimientoSeleccionado]);

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
      // Eliminar la línea onChange que causa el error
    },
    // Mostrar sitio destino para peticiones y préstamos, información para devoluciones
    ...(tipoMovimientoSeleccionado === "peticion" ||
    tipoMovimientoSeleccionado === "prestamo"
      ? [
          {
            name: "sitioDestinoId" as keyof Movimiento,
            label: "Sitio Destino",
            type: "select" as const,
            required: true,
            options: sitios.map((sitio) => ({
              value: sitio.id,
              label: sitio.nombre,
            })),
          },
        ]
      : tipoMovimientoSeleccionado === "devolver" && sitioDestinoAutomatico
        ? [
            {
              name: "sitioDestinoInfo" as keyof Movimiento,
              label: "Sitio de Destino (Automático)",
              type: "text" as const,
              required: false,
              readOnly: true,
            },
          ]
        : []),
    {
      name: "cantidad",
      label: "Cantidad",
      type: "number",
      required: true,
    },
    {
      name: "observaciones" as keyof Movimiento,
      label: "Observaciones",
      type: "text" as const,
      required: true,
    },
    ...(isAdmin
      ? [
          {
            name: "solicitanteId" as keyof Movimiento,
            label:
              tipoMovimientoSeleccionado === "peticion"
                ? "Solicitante"
                : "Persona que devuelve",
            type: "select" as const,
            required: true,
            options: personas.map((persona) => ({
              value: persona.id,
              label: `${persona.nombre} ${persona.apellido || ""}`,
            })),
          },
        ]
      : []),
  ];

  const actions = [
    {
      label: "Ver Detalles",
      onClick: (movimiento: Movimiento) => handleVerDetalles(movimiento),
      variant: "primary" as const,
      icon: <Eye className="h-4 w-4" />,
      show: () => true,
    },
    {
      label: "Aprobar",
      onClick: (movimiento: Movimiento) =>
        handleAprobarMovimiento(movimiento.id),
      variant: "primary" as const,
      icon: <CheckCircle className="h-4 w-4" />,
      show: (movimiento: Movimiento) => movimiento.estado === "NO_APROBADO",
    },
    {
      label: "Rechazar",
      onClick: (movimiento: Movimiento) =>
        handleRechazarMovimiento(movimiento.id),
      variant: "danger" as const,
      icon: <XCircle className="h-4 w-4" />,
      show: (movimiento: Movimiento) => movimiento.estado === "NO_APROBADO",
    },
  ];

  const handleTipoMovimientoSelect = (tipo: TipoMovimientoSeleccionado) => {
    setTipoMovimientoSeleccionado(tipo);
    setIsFormOpen(true);
  };

  const handleCreate = () => {};

  const handleSubmit = async (data: Partial<Movimiento>) => {
    try {
      const tipoMovimientoId = getTipoMovimientoId();
      const solicitanteId = isAdmin ? data.solicitanteId : user?.usuario?.id;

      if (
        !data.materialId ||
        !solicitanteId ||
        !data.cantidad ||
        !data.observaciones
      ) {
        throw new Error("Faltan campos requeridos");
      }

      if (!tipoMovimientoId) {
        throw new Error("No se pudo determinar el tipo de movimiento");
      }

      // Validación específica para devoluciones
      if (tipoMovimientoSeleccionado === "devolver") {
        const materialSeleccionado = materiales.find(
          (m) => m.id === Number(data.materialId)
        );

        if (!materialSeleccionado) {
          throw new Error("Material no encontrado");
        }

        // Validar que no se pueda devolver más de lo que se tiene prestado
        if (Number(data.cantidad) > (materialSeleccionado.cantidadPrestada || 0)) {
          throw new Error(
            `No puedes devolver ${data.cantidad} unidades. Solo tienes ${materialSeleccionado.cantidadPrestada || 0} unidades prestadas de este material.`
          );
        }
      }

      let sitioDestinoId: number;
      let sitioOrigenId: number | undefined;

      // Para devoluciones, determinar automáticamente el sitio destino
      if (tipoMovimientoSeleccionado === "devolver") {
        const sitioOrigen = getSitioOrigenMaterial(Number(data.materialId));
        if (!sitioOrigen) {
          throw new Error(
            "No se pudo determinar el sitio de origen para la devolución"
          );
        }
        sitioDestinoId = sitioOrigen;

        // Para devoluciones, el sitio origen es donde está actualmente el material
        const materialActual = materiales.find(
          (m) => m.id === Number(data.materialId)
        );
        sitioOrigenId = materialActual?.sitioId;
      } else {
        // Para peticiones y préstamos, validar que se haya seleccionado sitio destino
        if (
          (tipoMovimientoSeleccionado === "peticion" ||
            tipoMovimientoSeleccionado === "prestamo") &&
          !data.sitioDestinoId
        ) {
          throw new Error(
            "Se requiere seleccionar un sitio destino para las peticiones y préstamos."
          );
        }

        if (!data.sitioDestinoId) {
          throw new Error("Se requiere seleccionar un sitio destino.");
        }

        sitioDestinoId = Number(data.sitioDestinoId);
      }

      const movementData: CreateMovimientoDto = {
        materialId: Number(data.materialId),
        tipoMovimientoId,
        cantidad: Number(data.cantidad),
        sitioDestinoId,
        solicitanteId: Number(solicitanteId),
        aprobadorId: 1,
        descripcion: data.observaciones,
        ...(sitioOrigenId && { sitioOrigenId }),
      };

      await createMovimiento(movementData);
      await fetchMovimientos();

      // Simplificar el refresco después de crear movimiento
      if (tipoMovimientoSeleccionado === "devolver") {
        // Esperar un momento para que se complete la transacción
        setTimeout(() => {
          fetchMateriales();
        }, 1000);
      }

      const tipoTexto =
        tipoMovimientoSeleccionado === "peticion"
          ? "Petición"
          : tipoMovimientoSeleccionado === "prestamo"
            ? "Préstamo"
            : "Devolución";

      addToast({
        title: "Movimiento creado",
        description: `${tipoTexto} creado exitosamente.`,
        color: "success",
      });

      setIsFormOpen(false);
      setTipoMovimientoSeleccionado(null);
      setSitioDestinoAutomatico(null);
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

        <Button
          color={mostrarSoloPendientes ? "warning" : "primary"}
          variant={mostrarSoloPendientes ? "solid" : "bordered"}
          onPress={handleMostrarPendientes}
          startContent={<Clock className="h-4 w-4" />}
          className="font-medium"
        >
          {mostrarSoloPendientes
            ? `Pendientes (${movimientosPendientes.length})`
            : "Ver Pendientes"}
        </Button>
      </div>

      {/* Mostrar alerta si hay movimientos pendientes */}
      {!mostrarSoloPendientes && movimientosPendientes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Hay {movimientosPendientes.length} movimiento(s) pendiente(s) de
              aprobación
            </span>
          </div>
        </div>
      )}

      {/* Boxes para seleccionar tipo de movimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card
          isPressable
          onPress={() => handleTipoMovimientoSelect("peticion")}
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
          onPress={() => handleTipoMovimientoSelect("prestamo")}
          className="hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-orange-500"
        >
          <CardBody className="text-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-full">
                <ArrowRightLeft className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Préstamo
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Prestar materiales temporalmente
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card
          isPressable
          onPress={() => handleTipoMovimientoSelect("devolver")}
          className="hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-green-500"
        >
          <CardBody className="text-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                <ArrowDown className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Devolución
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Devolver materiales prestados
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      {/* Tabla de aprobación - Solo visible para administradores */}
      {isAdmin && (
        <DataTable
          data={mostrarSoloPendientes ? movimientosPendientes : movimientos}
          columns={columns}
          actions={actions}
          onCreate={handleCreate}
          getRowId={(movimiento) => movimiento.id}
          title={
            mostrarSoloPendientes
              ? "Movimientos Pendientes de Aprobación"
              : "Lista de Movimientos"
          }
          searchPlaceholder="Buscar movimientos..."
          emptyMessage={
            mostrarSoloPendientes
              ? "No hay movimientos pendientes"
              : "No se encontraron movimientos"
          }
          createButtonLabel="Selecciona un tipo de movimiento arriba"
          className="bg-white dark:bg-gray-800 rounded-lg shadow"
        />
      )}

      {/* Cards de detalles de movimientos - Visible para todos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isAdmin ? "Detalles de Movimientos" : "Mis Movimientos"}
          </h2>
          {!isAdmin && (
            <Button
              color={mostrarSoloPendientes ? "warning" : "primary"}
              variant={mostrarSoloPendientes ? "solid" : "bordered"}
              onPress={handleMostrarPendientes}
              startContent={<Clock className="h-4 w-4" />}
              className="font-medium"
            >
              {mostrarSoloPendientes
                ? `Pendientes (${movimientosPendientes.length})`
                : "Ver Pendientes"}
            </Button>
          )}
        </div>

        {(mostrarSoloPendientes ? movimientosPendientes : movimientos)
          .length === 0 ? (
          <Card>
            <CardBody className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {mostrarSoloPendientes
                  ? "No hay movimientos pendientes"
                  : "No se encontraron movimientos"}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(mostrarSoloPendientes ? movimientosPendientes : movimientos).map(
              (movimiento) => (
                <Card
                  key={movimiento.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardBody className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-2 rounded-full ${
                            movimiento.tipoMovimiento?.nombre === "Petición"
                              ? "bg-blue-100 dark:bg-blue-900"
                              : movimiento.tipoMovimiento?.nombre === "Préstamo"
                                ? "bg-orange-100 dark:bg-orange-900"
                                : "bg-green-100 dark:bg-green-900"
                          }`}
                        >
                          {movimiento.tipoMovimiento?.nombre === "Petición" ? (
                            <Package
                              className={`h-4 w-4 ${
                                movimiento.tipoMovimiento?.nombre === "Petición"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : movimiento.tipoMovimiento?.nombre ===
                                      "Préstamo"
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-green-600 dark:text-green-400"
                              }`}
                            />
                          ) : movimiento.tipoMovimiento?.nombre ===
                            "Préstamo" ? (
                            <ArrowRightLeft className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                            {movimiento.tipoMovimiento?.nombre}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {movimiento.id}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          movimiento.estado === "NO_APROBADO"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : movimiento.estado === "APROBADO"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {movimiento.estado}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {movimiento.material?.nombre}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Cantidad: {movimiento.cantidad}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Solicitante: {movimiento.solicitante?.nombre}{" "}
                          {movimiento.solicitante?.apellido}
                        </p>
                        {movimiento.sitioDestino && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Destino: {movimiento.sitioDestino.nombre}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Fecha:{" "}
                          {new Date(
                            movimiento.fechaCreacion
                          ).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => handleVerDetalles(movimiento)}
                        startContent={<Eye className="h-3 w-3" />}
                      >
                        Ver Detalles
                      </Button>

                      {isAdmin && movimiento.estado === "NO_APROBADO" && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() =>
                              handleAprobarMovimiento(movimiento.id)
                            }
                            startContent={<Check className="h-3 w-3" />}
                          >
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() =>
                              handleRechazarMovimiento(movimiento.id)
                            }
                            startContent={<X className="h-3 w-3" />}
                          >
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )
            )}
          </div>
        )}
      </div>

      {selectedMovimiento && (
        <Card className="mt-6">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Detalles del Movimiento #{selectedMovimiento.id}
              </h3>
              <Button
                variant="light"
                onPress={() => setSelectedMovimiento(null)}
              >
                Cerrar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p>
                  <strong>Material:</strong>{" "}
                  {selectedMovimiento.material?.nombre}
                </p>
                <p>
                  <strong>Cantidad:</strong> {selectedMovimiento.cantidad}
                </p>
                <p>
                  <strong>Tipo:</strong>{" "}
                  {selectedMovimiento.tipoMovimiento?.nombre}
                </p>
              </div>
              <div>
                <p>
                  <strong>Solicitante:</strong>{" "}
                  {selectedMovimiento.solicitante?.nombre}{" "}
                  {selectedMovimiento.solicitante?.apellido}
                </p>
                <p>
                  <strong>Estado:</strong> {selectedMovimiento.estado}
                </p>
                <p>
                  <strong>Sitio Destino:</strong>{" "}
                  {selectedMovimiento.sitioDestino?.nombre || "N/A"}
                </p>
              </div>
            </div>

            {detallesLoading ? (
              <div className="text-center py-4">
                <Clock className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Cargando detalles...</p>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold mb-2">Detalles del Proceso:</h4>
                {movimientoDetalles.length > 0 ? (
                  <div className="space-y-2">
                    {movimientoDetalles.map((detalle) => (
                      <div
                        key={detalle.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {detalle.tipoMovimiento?.nombre}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              detalle.estado === "PROCESADO"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {detalle.estado}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {detalle.material?.nombre} - Cantidad:{" "}
                          {detalle.cantidad}
                        </p>
                        <p className="text-xs text-gray-500">
                          Solicitante: {detalle.solicitante?.nombre}{" "}
                          {detalle.solicitante?.apellido}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No hay detalles disponibles para este movimiento.
                  </p>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {isFormOpen && (
        <GenericForm<Movimiento>
          fields={formFields}
          initialValues={{
            cantidad: 0,
            // Si no es administrador, pre-seleccionar el usuario actual
            ...(isAdmin ? {} : { solicitanteId: user?.usuario?.id }),
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default MovimientoPage;
