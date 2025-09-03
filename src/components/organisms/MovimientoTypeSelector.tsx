import React from "react";
import { Card, CardBody } from "@heroui/react";
import {
  Package,
  ArrowRightLeft,
  ArrowDown,
} from "lucide-react";

type TipoMovimiento = "peticion" | "prestamo" | "devolver";

interface MovimientoTypeSelectorProps {
  onTipoSelect: (tipo: TipoMovimiento) => void;
  className?: string;
}

const MovimientoTypeSelector: React.FC<MovimientoTypeSelectorProps> = ({
  onTipoSelect,
  className = "",
}) => {
  const tiposMovimiento = [
    {
      tipo: "peticion" as TipoMovimiento,
      titulo: "Petición",
      descripcion: "Solicitar materiales del inventario",
      icono: Package,
      colorClasses: {
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-600 dark:text-blue-400",
        hover: "hover:border-blue-500",
      },
    },
    {
      tipo: "prestamo" as TipoMovimiento,
      titulo: "Préstamo",
      descripcion: "Prestar materiales temporalmente",
      icono: ArrowRightLeft,
      colorClasses: {
        bg: "bg-orange-100 dark:bg-orange-900",
        text: "text-orange-600 dark:text-orange-400",
        hover: "hover:border-orange-500",
      },
    },
    {
      tipo: "devolver" as TipoMovimiento,
      titulo: "Devolución",
      descripcion: "Devolver materiales prestados",
      icono: ArrowDown,
      colorClasses: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-600 dark:text-green-400",
        hover: "hover:border-green-500",
      },
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 ${className}`}>
      {tiposMovimiento.map(({ tipo, titulo, descripcion, icono: Icono, colorClasses }) => (
        <Card
          key={tipo}
          isPressable
          onPress={() => onTipoSelect(tipo)}
          className={`hover:scale-105 transition-transform cursor-pointer border-2 border-transparent ${colorClasses.hover}`}
        >
          <CardBody className="text-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className={`p-4 ${colorClasses.bg} rounded-full`}>
                <Icono className={`h-8 w-8 ${colorClasses.text}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {titulo}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {descripcion}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default MovimientoTypeSelector;