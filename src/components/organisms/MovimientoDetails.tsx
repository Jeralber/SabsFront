import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Clock } from "lucide-react";
import { Movimiento } from "../../types/movimiento.types";
import { Detalles } from "../../types/detalles.types";

interface MovimientoDetailsProps {
  movimiento: Movimiento;
  detalles: Detalles[];
  isLoading: boolean;
  onClose: () => void;
  className?: string;
}

const MovimientoDetails: React.FC<MovimientoDetailsProps> = ({
  movimiento,
  detalles,
  isLoading,
  onClose,
  className = "",
}) => {
  return (
    <Card className={`mt-6 ${className}`}>
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Detalles del Movimiento #{movimiento.id}
          </h3>
          <Button variant="light" onPress={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p>
              <strong>Material:</strong> {movimiento.material?.nombre}
            </p>
            <p>
              <strong>Cantidad:</strong> {movimiento.cantidad}
            </p>
            <p>
              <strong>Tipo:</strong> {movimiento.tipoMovimiento?.nombre}
            </p>
          </div>
          <div>
            <p>
              <strong>Solicitante:</strong> {movimiento.solicitante?.nombre}{" "}
              {movimiento.solicitante?.apellido}
            </p>
            <p>
              <strong>Estado:</strong> {movimiento.estado}
            </p>
            <p>
              <strong>Sitio Destino:</strong>{" "}
              {movimiento.sitioDestino?.nombre || "N/A"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <Clock className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Cargando detalles...</p>
          </div>
        ) : (
          <div>
            <h4 className="font-semibold mb-2">Detalles del Proceso:</h4>
            {detalles.length > 0 ? (
              <div className="space-y-2">
                {detalles.map((detalle) => (
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
                      {detalle.material?.nombre} - Cantidad: {detalle.cantidad}
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
  );
};

export default MovimientoDetails;