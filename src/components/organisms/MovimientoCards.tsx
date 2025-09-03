import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Movimiento } from "../../types/movimiento.types";
import {
  ArrowDown,
  Package,
  Eye,
  ArrowRightLeft,
  Check,
  X,
  Clock,
} from "lucide-react";

interface MovimientoCardsProps {
  movimientos: Movimiento[];
  mostrarSoloPendientes: boolean;
  isAdmin: boolean;
  onVerDetalles: (movimiento: Movimiento) => void;
  onAprobarMovimiento: (movimientoId: number) => void;
  onRechazarMovimiento: (movimientoId: number) => void;
  onMostrarPendientes: () => void;
}

const MovimientoCards: React.FC<MovimientoCardsProps> = ({
  movimientos,
  mostrarSoloPendientes,
  isAdmin,
  onVerDetalles,
  onAprobarMovimiento,
  onRechazarMovimiento,
  onMostrarPendientes
}) => {
  if (movimientos.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isAdmin ? "Detalles de Movimientos" : "Mis Movimientos"}
        </h2>
        {!isAdmin && (
          <Button
            color={mostrarSoloPendientes ? "warning" : "primary"}
            variant={mostrarSoloPendientes ? "solid" : "bordered"}
            onPress={onMostrarPendientes}
            startContent={<Clock className="h-4 w-4" />}
            className="font-medium"
          >
            {mostrarSoloPendientes
              ? `Pendientes (${movimientos.length})`
              : "Ver Pendientes"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movimientos.map((movimiento) => (
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
                            : movimiento.tipoMovimiento?.nombre === "Préstamo"
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-green-600 dark:text-green-400"
                        }`}
                      />
                    ) : movimiento.tipoMovimiento?.nombre === "Préstamo" ? (
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
                    {new Date(movimiento.fechaCreacion).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => onVerDetalles(movimiento)}
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
                      onPress={() => onAprobarMovimiento(movimiento.id)}
                      startContent={<Check className="h-3 w-3" />}
                    >
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => onRechazarMovimiento(movimiento.id)}
                      startContent={<X className="h-3 w-3" />}
                    >
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MovimientoCards;