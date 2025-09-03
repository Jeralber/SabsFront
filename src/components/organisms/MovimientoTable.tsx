import React from "react";
import { DataTable } from "../molecules/DataTable";
import { Movimiento } from "../../types/movimiento.types";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string;
};

interface MovimientoTableProps {
  movimientos: Movimiento[];
  mostrarSoloPendientes: boolean;
  onVerDetalles: (movimiento: Movimiento) => void;
  onAprobarMovimiento: (movimientoId: number) => void;
  onRechazarMovimiento: (movimientoId: number) => void;
  onCreate: () => void;
}

const MovimientoTable: React.FC<MovimientoTableProps> = ({
  movimientos,
  mostrarSoloPendientes,
  onVerDetalles,
  onAprobarMovimiento,
  onRechazarMovimiento,
  onCreate
}) => {
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

  const actions = [
    {
      label: "Ver Detalles",
      onClick: (movimiento: Movimiento) => onVerDetalles(movimiento),
      variant: "primary" as const,
      icon: <Eye className="h-4 w-4" />,
      show: () => true,
    },
    {
      label: "Aprobar",
      onClick: (movimiento: Movimiento) => onAprobarMovimiento(movimiento.id),
      variant: "primary" as const,
      icon: <CheckCircle className="h-4 w-4" />,
      show: (movimiento: Movimiento) => movimiento.estado === "NO_APROBADO",
    },
    {
      label: "Rechazar",
      onClick: (movimiento: Movimiento) => onRechazarMovimiento(movimiento.id),
      variant: "danger" as const,
      icon: <XCircle className="h-4 w-4" />,
      show: (movimiento: Movimiento) => movimiento.estado === "NO_APROBADO",
    },
  ];

  return (
    <DataTable
      data={movimientos}
      columns={columns}
      actions={actions}
      onCreate={onCreate}
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
  );
};

export default MovimientoTable;