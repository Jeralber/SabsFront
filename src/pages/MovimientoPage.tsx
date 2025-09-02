import React, { useState, useEffect } from "react";
import { DataTable } from "../components/molecules/DataTable";
import { useMovimiento } from "../hooks/useMovimiento";
import { useTipoMovimiento } from "../hooks/useTipoMovimiento";
import { usePersona } from "../hooks/usePersona";
import { useMaterial } from "../hooks/useMaterial";
import { useDetalles } from "../hooks/useDetalles";
import { Movimiento, CreateMovimientoDto } from "../types/movimiento.types";
import { Material } from "../types/material.types";
import { materialService } from "@/services/materialService";

import {
  addToast,
  Card,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Minus,
  ShoppingCart,
  Undo2,
  HandHeart,
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

type DetalleMovimiento = {
  materialId: number;
  cantidad: number;
  material?: Material;
};

function MovimientoPage() {
  const { sitios } = useSitio();
  const { user } = useAuth();

  const isAdmin = user?.usuario?.rol?.toLowerCase() === "administrador";

  const {
    movimientos,
    loading,
    fetchMovimientos,
    createMovimiento,
    aprobarMovimiento,
    rechazarMovimiento,
    devolverMaterial,
    getPrestamosActivos, // ✅ AGREGADO
  } = useMovimiento();

  const { tiposMovimiento, fetchTiposMovimiento } = useTipoMovimiento();
  const { personas, fetchPersonas } = usePersona();
  const { materiales, fetchMyMaterials, fetchMaterialesPrestadosPendientes } =
    useMaterial();

  const {
    detalles,
    fetchDetallesPorMovimiento,
    loading: detallesLoading,
  } = useDetalles();

  // Estados del componente
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetallesModalOpen, setIsDetallesModalOpen] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] =
    useState<Movimiento | null>(null);
  const [tipoMovimientoSeleccionado, setTipoMovimientoSeleccionado] =
    useState<TipoMovimientoSeleccionado>(null);
  const [mostrarSoloPendientes, setMostrarSoloPendientes] = useState(false);
  const [detallesMovimiento, setDetallesMovimiento] = useState<
    DetalleMovimiento[]
  >([{ materialId: 0, cantidad: 1 }]);
  const [sitioOrigenId, setSitioOrigenId] = useState<number | null>(null);
  const [sitioDestinoId, setSitioDestinoId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState("");
  const [solicitanteId, setSolicitanteId] = useState<number | null>(null);

  // ✅ NUEVOS ESTADOS para manejo de préstamos activos
  const [prestamosActivos, setPrestamosActivos] = useState<any[]>([]);
  const [isSeleccionPrestamoModalOpen, setIsSeleccionPrestamoModalOpen] =
    useState(false);
  const [materialParaDevolucion, setMaterialParaDevolucion] = useState<
    number | null
  >(null);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<any | null>(
    null
  );

  // Funciones de utilidad
  const crearEtiquetaMaterial = (material: Material) => {
    const sitioInfo = material.sitio ? ` (${material.sitio.nombre})` : "";

    let stockInfo = "";
    let estadoInfo = "";

    if (!material.activo) {
      estadoInfo = " [INACTIVO]";
    }

    if (material.esOriginal === false) {
      if (material.cantidadPrestada && material.cantidadPrestada > 0) {
        stockInfo = ` - Pendiente: ${material.cantidadPrestada}`;
        estadoInfo = " [PRÉSTAMO ACTIVO]";
      } else {
        estadoInfo = " [PRÉSTAMO DEVUELTO]";
      }
    } else if (material.stocks && material.stocks.length > 0) {
      // Si hay sitio de origen seleccionado, mostrar stock en ese sitio
      if (sitioOrigenId != null) {
        const stockEnOrigen = material.stocks
          .filter(
            (s: any) =>
              s.activo &&
              Number(s.sitioId ?? (material as any).sitioId ?? -1) ===
                Number(sitioOrigenId)
          )
          .reduce(
            (total: number, s: any) => total + (Number(s.cantidad) || 0),
            0
          );
        const registradoAqui =
          Number((material as any).sitioId) === Number(sitioOrigenId);
        stockInfo = ` - Stock en origen: ${stockEnOrigen}${registradoAqui ? " [REGISTRADO AQUÍ]" : ""}`;
      } else {
        // Si no hay sitio seleccionado aún, mostrar total global
        const stockTotal = material.stocks
          .filter((s: any) => s.activo)
          .reduce(
            (total: number, s: any) => total + (Number(s.cantidad) || 0),
            0
          );
        stockInfo = ` - Stock: ${stockTotal}`;
      }
    } else {
      stockInfo = " - Sin stock";
    }

    return `${material.nombre}${sitioInfo}${stockInfo}${estadoInfo}`;
  };

  const getMaterialesFiltrados = () => {
    if (tipoMovimientoSeleccionado === "peticion") {
      return materiales.filter((material) => {
        const esOriginal = material.esOriginal !== false;
        const activo = !!material.activo;

        const tieneStockActivoEnAlgunaParte =
          Array.isArray(material.stocks) &&
          material.stocks.some(
            (stock: any) => stock.activo && Number(stock.cantidad) > 0
          );

        if (sitioOrigenId != null) {
          const stockEnOrigen = Array.isArray(material.stocks)
            ? material.stocks
                .filter(
                  (stock: any) =>
                    stock.activo &&
                    Number(stock.sitioId) === Number(sitioOrigenId) &&
                    Number(stock.cantidad) > 0
                )
                .reduce(
                  (acc: number, s: any) => acc + Number(s.cantidad || 0),
                  0
                )
            : 0;

          const registradoAqui =
            Number((material as any).sitioId) === Number(sitioOrigenId);

          // Mantener visibles los registrados aquí aunque stock en origen sea 0 (solo vista)
          return (
            esOriginal &&
            activo &&
            (registradoAqui ||
              stockEnOrigen > 0 ||
              tieneStockActivoEnAlgunaParte)
          );
        }

        return esOriginal && activo && tieneStockActivoEnAlgunaParte;
      });
    } else if (tipoMovimientoSeleccionado === "devolver") {
      // Mostrar materiales ORIGINALES activos para poder ver sus préstamos
      return materiales.filter((material) => {
        const esOriginal = material.esOriginal !== false;
        const activo = !!material.activo;
        return esOriginal && activo;
      });
    } else if (tipoMovimientoSeleccionado === "prestamo") {
      return materiales.filter((material) => {
        const esOriginal = material.esOriginal !== false;
        const activo = !!material.activo;

        const tieneStockActivoEnAlgunaParte =
          Array.isArray(material.stocks) &&
          material.stocks.some(
            (stock: any) => stock.activo && Number(stock.cantidad) > 0
          );

        if (sitioOrigenId != null) {
          const stockEnOrigen = Array.isArray(material.stocks)
            ? material.stocks
                .filter(
                  (stock: any) =>
                    stock.activo &&
                    Number(stock.sitioId) === Number(sitioOrigenId) &&
                    Number(stock.cantidad) > 0
                )
                .reduce(
                  (acc: number, s: any) => acc + Number(s.cantidad || 0),
                  0
                )
            : 0;

          const registradoAqui =
            Number((material as any).sitioId) === Number(sitioOrigenId);

          const incluir =
            esOriginal &&
            activo &&
            (registradoAqui ||
              stockEnOrigen > 0 ||
              tieneStockActivoEnAlgunaParte);

          if (!incluir) {
            console.log("[DEBUG][Filtro prestamo] Excluido", {
              materialId: material.id,
              nombre: material.nombre,
              sitioOrigenId,
              registradoAqui,
              stockEnOrigen,
              tieneStockActivoEnAlgunaParte,
              stocks: material.stocks,
            });
          }

          return incluir;
        }

        return esOriginal && activo && tieneStockActivoEnAlgunaParte;
      });
    }
    return materiales;
  };

  const getStockDisponibleEnSitio = async (
    materialId: number,
    sitioId: number
  ) => {
    try {
      const sitioIdNum = Number(sitioId);
      const res = await materialService.getById(materialId);
      const material: any = res?.data ?? null;
      const stocks: Array<{
        sitioId?: number | string;
        activo: boolean;
        cantidad: number;
        id?: number | string;
        codigo?: string;
      }> = material?.stocks ?? [];

      const resumen = stocks.map((s) => {
        const efectivoSitioId = Number(s.sitioId ?? material?.sitioId ?? -1);
        return {
          id: s.id,
          codigo: s.codigo,
          activo: !!s.activo,
          sitioId: efectivoSitioId,
          cantidad: Number(s.cantidad) || 0,
        };
      });
      const porSitio = resumen.reduce(
        (acc, s) => {
          acc[s.sitioId] = (acc[s.sitioId] || 0) + s.cantidad;
          return acc;
        },
        {} as Record<number, number>
      );

      console.log("[DEBUG] getStockDisponibleEnSitio()", {
        materialId,
        sitioIdParam: sitioId,
        sitioIdNum,
        resumen,
        porSitio,
      });

      const disponible = resumen
        .filter((s) => s.activo && s.sitioId === sitioIdNum)
        .reduce((sum, s) => sum + s.cantidad, 0);

      console.log("[DEBUG] disponible calculado", {
        materialId,
        sitioIdNum,
        disponible,
      });
      return disponible;
    } catch (e) {
      console.warn("[WARN] getStockDisponibleEnSitio() error", {
        materialId,
        sitioId,
        error: e,
      });
      return 0;
    }
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
      const tipoPrestamo = tiposMovimiento.find(
        (tipo) =>
          tipo.nombre.toLowerCase().includes("prestamo") ||
          tipo.nombre.toLowerCase().includes("préstamo")
      );
      return tipoPrestamo?.id;
    }
    return undefined;
  };

  // Manejo de detalles múltiples
  const agregarDetalle = () => {
    setDetallesMovimiento([
      ...detallesMovimiento,
      { materialId: 0, cantidad: 1 },
    ]);
  };

  const removerDetalle = (index: number) => {
    if (detallesMovimiento.length > 1) {
      setDetallesMovimiento(detallesMovimiento.filter((_, i) => i !== index));
    }
  };

  const actualizarDetalle = (
    index: number,
    campo: keyof DetalleMovimiento,
    valor: any
  ) => {
    const nuevosDetalles = [...detallesMovimiento];
    nuevosDetalles[index] = { ...nuevosDetalles[index], [campo]: valor };
    setDetallesMovimiento(nuevosDetalles);
  };

  const handleChangeSitioOrigen = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valueNum = Number(e.target.value);
    console.log(
      "[DEBUG] Cambio sitio origen (raw, num):",
      e.target.value,
      valueNum
    );
    setSitioOrigenId(Number.isNaN(valueNum) ? null : valueNum);
  };

  const obtenerPrestamosActivos = async (materialId: number) => {
    try {
      const prestamos = await getPrestamosActivos(materialId);
      setPrestamosActivos(prestamos || []);
      setMaterialParaDevolucion(materialId);
      setIsSeleccionPrestamoModalOpen(true);
    } catch (error) {
      console.error("Error al obtener préstamos activos:", error);
      addToast({
        title: "Error",
        description: "No se pudieron cargar los préstamos activos",
        color: "danger",
      });
    }
  };

  const seleccionarPrestamo = (prestamo: any) => {
    setPrestamoSeleccionado(prestamo);
    setIsSeleccionPrestamoModalOpen(false);

    if (!materialParaDevolucion) return;

    const nuevoDetalle = {
      materialId: materialParaDevolucion,
      cantidad: Math.min(1, prestamo?.saldoPendiente || 1),
      material: materiales.find((m) => m.id === materialParaDevolucion),
    };

    setDetallesMovimiento([nuevoDetalle]);

    addToast({
      title: "Préstamo seleccionado",
      description: `Préstamo del ${new Date(prestamo.fechaCreacion).toLocaleDateString()} seleccionado para devolución`,
      color: "success",
    });
  };

  const handleVerDetalles = async (movimiento: Movimiento) => {
    setSelectedMovimiento(movimiento);
    try {
      await fetchDetallesPorMovimiento(movimiento.id);
      setIsDetallesModalOpen(true);
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
      // Preferir el id de la persona autenticada; evitar fallback 1
      const aprobadorIdRaw =
        (user as any)?.persona?.id ?? (user as any)?.usuario?.id ?? null;

      if (aprobadorIdRaw == null) {
        addToast({
          title: "Error",
          description: "No se encontró el ID del aprobador en la sesión",
          color: "danger",
        });
        return;
      }

      const aprobadorId = Number(aprobadorIdRaw);
      if (Number.isNaN(aprobadorId)) {
        addToast({
          title: "Error",
          description: "ID de aprobador inválido",
          color: "danger",
        });
        return;
      }

      const movimiento = movimientos.find((m) => m.id === movimientoId);
      console.log("[DEBUG] handleAprobarMovimiento()", {
        movimientoId,
        movimiento,
      });

      await aprobarMovimiento(movimientoId, aprobadorId);
      await fetchMovimientos();
      await fetchMyMaterials();

      addToast({
        title: "Movimiento aprobado",
        description: "El movimiento ha sido aprobado exitosamente",
        color: "success",
      });
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo aprobar el movimiento";

      console.error("Error al aprobar movimiento:", error);
      addToast({
        title: "Error",
        description: serverMessage,
        color: "danger",
      });
    }
  };

  const handleRechazarMovimiento = async (movimientoId: number) => {
    try {
      const rechazadoPorId = user?.usuario?.id || 1;
      await rechazarMovimiento(movimientoId, rechazadoPorId);
      await fetchMovimientos();

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

  const handleTipoMovimientoSelect = async (
    tipo: TipoMovimientoSeleccionado
  ) => {
    setTipoMovimientoSeleccionado(tipo);

    // Cargar materiales específicos según el tipo
    if (tipo === "devolver") {
      await fetchMaterialesPrestadosPendientes();
    } else {
      await fetchMyMaterials();
    }

    // Resetear formulario
    setDetallesMovimiento([{ materialId: 0, cantidad: 1 }]);
    setSitioOrigenId(null);
    setSitioDestinoId(null);
    setObservaciones("");
    setSolicitanteId(isAdmin ? null : user?.usuario?.id || null);

    setIsFormOpen(true);
  };

  // Dentro del componente MovimientoPage
  const handleSubmit = async () => {
    try {
      const tipoMovimientoId = getTipoMovimientoId();
      const personaSolicitaId = isAdmin ? solicitanteId : user?.usuario?.id;

      if (!personaSolicitaId || !tipoMovimientoId) {
        throw new Error("Faltan campos requeridos");
      }

      const detallesValidos = detallesMovimiento.filter(
        (d) => d.materialId > 0 && d.cantidad > 0
      );
      if (detallesValidos.length === 0) {
        throw new Error("Debe agregar al menos un material");
      }

      if (tipoMovimientoSeleccionado === "devolver") {
        if (!prestamoSeleccionado) {
          throw new Error(
            "Debe seleccionar un préstamo activo para realizar la devolución"
          );
        }

        await devolverMaterial(prestamoSeleccionado.id, {
          personaSolicitaId,
          detalles: detallesValidos.map((d) => ({
            materialId: d.materialId,
            cantidad: d.cantidad,
          })),
        });
      } else {
        if (!sitioOrigenId) {
          throw new Error("Debe seleccionar un sitio de origen");
        }

        // Validar stock disponible por cada material antes de crear
        for (const d of detallesValidos) {
          const disponible = await getStockDisponibleEnSitio(
            d.materialId,
            sitioOrigenId
          );
          if (disponible < d.cantidad) {
            throw new Error(
              `Stock insuficiente para el material seleccionado (solicitado: ${d.cantidad}, disponible: ${disponible})`
            );
          }
        }

        const dto: CreateMovimientoDto = {
          personaSolicitaId,
          sitioOrigenId,
          sitioDestinoId: sitioDestinoId || undefined,
          tipoMovimientoId,
          detalles: detallesValidos.map((d) => ({
            materialId: d.materialId,
            cantidad: d.cantidad,
          })),
        };

        await createMovimiento(dto);
      }

      await fetchMovimientos();
      await fetchMyMaterials();
      setIsFormOpen(false);

      addToast({
        title: "Movimiento creado",
        description: "El movimiento ha sido creado exitosamente",
        color: "success",
      });
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error?.message || "No se pudo crear el movimiento",
        color: "danger",
      });
    }
  };

  // Columnas de la tabla
  // Definición de columnas: corregir accessorKey de solicitante
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
          {row.tipoMovimiento?.nombre?.toLowerCase().includes("entrada") ||
          row.tipoMovimiento?.nombre?.toLowerCase().includes("devolucion") ? (
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
      accessorKey: "detalles",
      header: "Materiales",
      sortable: false,
      cell: (row: Movimiento) => (
        <div className="text-sm">
          {row.detalles && row.detalles.length > 0 ? (
            <span className="text-blue-600 font-medium">
              {row.detalles.length} material
              {row.detalles.length > 1 ? "es" : ""}
            </span>
          ) : (
            <span className="text-gray-500">Sin detalles</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "sitioDestino",
      header: "Sitio Destino",
      sortable: false,
      cell: (row: Movimiento) => row.sitioDestino?.nombre || "Sin sitio",
    },
    {
      accessorKey: "personaSolicita",
      header: "Solicitante",
      sortable: true,
      cell: (row: Movimiento) => (
        <span className="text-sm text-gray-600">
          {row.personaSolicita
            ? `${row.personaSolicita.nombre} ${row.personaSolicita.apellido || ""}`
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
            case "aprobado":
              return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "rechazado":
              return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default:
              return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
          }
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(row.estado)}`}
          >
            {row.estado.toUpperCase()}
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

  const actions = [
    {
      label: "Ver Detalles",
      onClick: (movimiento: Movimiento) => {
        void handleVerDetalles(movimiento);
      },
      variant: "primary" as const,
      icon: <Eye className="h-4 w-4" />,
      show: () => true,
    },
    {
      label: "Aprobar",
      onClick: (movimiento: Movimiento) => {
        void handleAprobarMovimiento(movimiento.id);
      },
      variant: "primary" as const,
      icon: <CheckCircle className="h-4 w-4" />,
      show: (movimiento: Movimiento) =>
        movimiento.estado === "pendiente" && isAdmin,
    },
    {
      label: "Rechazar",
      onClick: (movimiento: Movimiento) => {
        void handleRechazarMovimiento(movimiento.id);
      },
      variant: "danger" as const,
      icon: <XCircle className="h-4 w-4" />,
      show: (movimiento: Movimiento) =>
        movimiento.estado === "pendiente" && isAdmin,
    },
  ];

  // Effects
  useEffect(() => {
    fetchMovimientos();
    fetchTiposMovimiento();
    fetchPersonas();
    fetchMyMaterials();
  }, []);

  // Filtrar movimientos
  const movimientosFiltrados = mostrarSoloPendientes
    ? movimientos.filter((m) => m.estado === "pendiente")
    : movimientos;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Movimientos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra peticiones, préstamos y devoluciones de materiales
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            color={mostrarSoloPendientes ? "primary" : "default"}
            variant={mostrarSoloPendientes ? "solid" : "bordered"}
            onPress={() => setMostrarSoloPendientes(!mostrarSoloPendientes)}
            startContent={<Clock className="h-4 w-4" />}
          >
            {mostrarSoloPendientes ? "Mostrar Todos" : "Solo Pendientes"}
          </Button>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          isPressable
          onPress={() => handleTipoMovimientoSelect("peticion")}
        >
          <CardBody className="flex flex-row items-center gap-4 p-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nueva Petición</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Solicitar materiales del inventario
              </p>
            </div>
          </CardBody>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          isPressable
          onPress={() => handleTipoMovimientoSelect("prestamo")}
        >
          <CardBody className="flex flex-row items-center gap-4 p-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <HandHeart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nuevo Préstamo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Prestar materiales temporalmente
              </p>
            </div>
          </CardBody>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          isPressable
          onPress={() => handleTipoMovimientoSelect("devolver")}
        >
          <CardBody className="flex flex-row items-center gap-4 p-6">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Undo2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Devolución</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Devolver materiales prestados
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <DataTable
            data={movimientosFiltrados}
            columns={columns}
            actions={actions}
            getRowId={(row: Movimiento) => row.id} // ✅ requerido por DataTable
            showSearch
            showColumnSelector
            pageSize={15}
          />
        </CardBody>
      </Card>

      {/* Modal de formulario */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold">
              {tipoMovimientoSeleccionado === "peticion" && "Nueva Petición"}
              {tipoMovimientoSeleccionado === "prestamo" && "Nuevo Préstamo"}
              {tipoMovimientoSeleccionado === "devolver" && "Nueva Devolución"}
            </h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Sitios (solo para peticiones y préstamos) */}
              {(tipoMovimientoSeleccionado === "peticion" ||
                tipoMovimientoSeleccionado === "prestamo") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sitio Origen
                    </label>
                    <select
                      className="w-full p-2 border rounded-lg"
                      value={sitioOrigenId || ""}
                      onChange={handleChangeSitioOrigen}
                    >
                      <option value="">Seleccionar sitio origen</option>
                      {sitios.map((sitio) => (
                        <option key={sitio.id} value={sitio.id}>
                          {sitio.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sitio Destino *
                    </label>
                    <select
                      className="w-full p-2 border rounded-lg"
                      value={sitioDestinoId || ""}
                      onChange={(e) =>
                        setSitioDestinoId(Number(e.target.value) || null)
                      }
                      required
                    >
                      <option value="">Seleccionar sitio destino</option>
                      {sitios.map((sitio) => (
                        <option key={sitio.id} value={sitio.id}>
                          {sitio.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Solicitante (solo para admin) */}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {tipoMovimientoSeleccionado === "peticion" &&
                      "Solicitante *"}
                    {tipoMovimientoSeleccionado === "prestamo" &&
                      "Persona que recibe *"}
                    {tipoMovimientoSeleccionado === "devolver" &&
                      "Persona que devuelve *"}
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={solicitanteId || ""}
                    onChange={(e) =>
                      setSolicitanteId(Number(e.target.value) || null)
                    }
                    required
                  >
                    <option value="">Seleccionar persona</option>
                    {personas.map((persona) => (
                      <option key={persona.id} value={persona.id}>
                        {persona.nombre} {persona.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Detalles de materiales */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium">
                    Materiales *
                  </label>
                  <Button
                    size="sm"
                    color="primary"
                    variant="bordered"
                    onPress={agregarDetalle}
                    startContent={<Plus className="h-4 w-4" />}
                  >
                    Agregar Material
                  </Button>
                </div>

                <div className="space-y-3">
                  {detallesMovimiento.map((detalle, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">
                          Material
                        </label>

                        <select
                          className="w-full p-2 border rounded-lg text-sm"
                          value={detalle.materialId}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            actualizarDetalle(index, "materialId", value);
                            if (
                              tipoMovimientoSeleccionado === "devolver" &&
                              value > 0
                            ) {
                              void obtenerPrestamosActivos(value);
                            }
                          }}
                          required
                        >
                          <option value={0}>Seleccionar material</option>
                          {getMaterialesFiltrados().map((material) => (
                            <option key={material.id} value={material.id}>
                              {crearEtiquetaMaterial(material)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {tipoMovimientoSeleccionado !== "devolver" && (
                        <div className="w-24">
                          <label className="block text-xs text-gray-600 mb-1">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="w-full p-2 border rounded-lg text-sm"
                            value={detalle.cantidad}
                            onChange={(e) =>
                              actualizarDetalle(
                                index,
                                "cantidad",
                                Number(e.target.value)
                              )
                            }
                            required
                          />
                        </div>
                      )}

                      {detallesMovimiento.length > 1 && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => removerDetalle(index)}
                          isIconOnly
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Observaciones (solo para peticiones y préstamos) */}
              {tipoMovimientoSeleccionado !== "devolver" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Observaciones
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-lg"
                    rows={3}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ingrese observaciones adicionales..."
                  />
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={loading}>
              Crear Movimiento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={isDetallesModalOpen}
        onClose={() => setIsDetallesModalOpen(false)}
        size="3xl"
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold">
              Detalles del Movimiento #{selectedMovimiento?.id}
            </h2>
          </ModalHeader>
          <ModalBody>
            {selectedMovimiento && (
              <div className="space-y-6">
                {/* Información general */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Información General</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Tipo:</strong>{" "}
                        {selectedMovimiento.tipoMovimiento?.nombre}
                      </p>
                      <p>
                        <strong>Estado:</strong>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs ${
                            selectedMovimiento.estado === "aprobado"
                              ? "bg-green-100 text-green-800"
                              : selectedMovimiento.estado === "rechazado"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedMovimiento.estado.toUpperCase()}
                        </span>
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {new Date(
                          selectedMovimiento.fechaCreacion
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Personas</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Solicitante:</strong>{" "}
                        {selectedMovimiento.personaSolicita?.nombre}{" "}
                        {selectedMovimiento.personaSolicita?.apellido}
                      </p>
                      {selectedMovimiento.personaAprueba && (
                        <p>
                          <strong>Aprobado por:</strong>{" "}
                          {selectedMovimiento.personaAprueba.nombre}{" "}
                          {selectedMovimiento.personaAprueba.apellido}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sitios */}
                <div>
                  <h3 className="font-semibold mb-2">Sitios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {selectedMovimiento.sitioOrigen && (
                      <p>
                        <strong>Origen:</strong>{" "}
                        {selectedMovimiento.sitioOrigen.nombre}
                      </p>
                    )}
                    {selectedMovimiento.sitioDestino && (
                      <p>
                        <strong>Destino:</strong>{" "}
                        {selectedMovimiento.sitioDestino.nombre}
                      </p>
                    )}
                  </div>
                </div>

                {/* Detalles de materiales */}
                <div>
                  <h3 className="font-semibold mb-2">Materiales</h3>
                  {detallesLoading ? (
                    <p>Cargando detalles...</p>
                  ) : detalles && detalles.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Material</th>
                            <th className="text-left p-2">Cantidad</th>
                            <th className="text-left p-2">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalles.map((detalle) => (
                            <tr key={detalle.id} className="border-b">
                              <td className="p-2">
                                {detalle.material?.nombre ||
                                  "Material no encontrado"}
                              </td>
                              <td className="p-2">{detalle.cantidad}</td>
                              <td className="p-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    detalle.estado === "aprobado"
                                      ? "bg-green-100 text-green-800"
                                      : detalle.estado === "rechazado"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {detalle.estado}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay detalles disponibles</p>
                  )}
                </div>

                {/* Observaciones */}
                {selectedMovimiento.observaciones && (
                  <div>
                    <h3 className="font-semibold mb-2">Observaciones</h3>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {selectedMovimiento.observaciones}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={() => setIsDetallesModalOpen(false)}
            >
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de selección de préstamo activo */}
      <Modal
        isOpen={isSeleccionPrestamoModalOpen}
        onClose={() => setIsSeleccionPrestamoModalOpen(false)}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-lg font-bold">Seleccionar préstamo activo</h2>
          </ModalHeader>
          <ModalBody>
            {!materialParaDevolucion && (
              <p className="text-sm text-gray-500">
                Seleccione un material para ver sus préstamos activos.
              </p>
            )}

            {materialParaDevolucion && prestamosActivos.length === 0 && (
              <p className="text-sm text-gray-500">
                No hay préstamos activos para el material seleccionado.
              </p>
            )}

            {prestamosActivos.length > 0 && (
              <div className="space-y-2">
                {prestamosActivos.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="text-sm">
                      <p className="font-medium">
                        Movimiento #{p.id} —{" "}
                        {new Date(p.fechaCreacion).toLocaleString()}
                      </p>
                      <p className="text-gray-600">
                        Saldo pendiente: {p.saldoPendiente}
                      </p>
                    </div>
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => seleccionarPrestamo(p)}
                    >
                      Seleccionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setIsSeleccionPrestamoModalOpen(false)}
            >
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default MovimientoPage;
