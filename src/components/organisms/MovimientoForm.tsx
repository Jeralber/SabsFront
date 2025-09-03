import React, { useState } from "react";
import { GenericForm, FieldDefinition } from "../molecules/GenericForm";
import { Movimiento } from "../../types/movimiento.types";


type TipoMovimientoSeleccionado = "peticion" | "devolver" | "prestamo" | null;

type MovimientoFormField = FieldDefinition<Movimiento> | {
  name: string;
  label: string;
  type: "text" | "select" | "number" | "checkbox";
  required?: boolean;
  readOnly?: boolean;
  options?: { value: any; label: string }[];
  onChange?: (value: any) => void;
};

interface MovimientoFormProps {
  isOpen: boolean;
  tipoMovimiento: TipoMovimientoSeleccionado;
  materiales: any[];
  sitios: any[];
  personas: any[];
  tiposMovimiento: any[];
  isAdmin: boolean;
  user: any;
  sitioDestinoAutomatico: number | null;
  onSubmit: (data: Partial<Movimiento>) => Promise<void>;
  onCancel: () => void;
  onMaterialChange: (materialId: number) => void;
  getSitioOrigenMaterial: (materialId: number) => number | null;
}

const MovimientoForm: React.FC<MovimientoFormProps> = ({
  isOpen,
  tipoMovimiento,
  materiales,
  sitios,
  personas,
  tiposMovimiento,
  isAdmin,
  user,
  sitioDestinoAutomatico,
  onSubmit,
  onCancel,
  onMaterialChange,
  getSitioOrigenMaterial
}) => {
  const [materialSeleccionado, setMaterialSeleccionado] = useState<number | null>(null);

  const crearEtiquetaMaterial = (material: any) => {
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
      const stockTotal = material.stocks
        .filter((stock: any) => stock.activo)
        .reduce((total: number, stock: any) => total + stock.cantidad, 0);
      stockInfo = ` - Stock: ${stockTotal}`;
    } else {
      stockInfo = " - Sin stock";
    }
    
    return `${material.nombre}${sitioInfo}${stockInfo}${estadoInfo}`;
  };

  const getMaterialesFiltrados = () => {
    if (tipoMovimiento === "peticion") {
      const filtrados = materiales.filter(
        (material) => {
          const esOriginal = material.esOriginal !== false;
          const tieneStocks = material.stocks && material.stocks.length > 0;
          const tieneStockActivo = material.stocks && 
            material.stocks.some((stock: any) => stock.activo && stock.cantidad > 0);
          
          return esOriginal && tieneStocks && tieneStockActivo;
        }
      );
      
      return filtrados;
    } else if (tipoMovimiento === "devolver") {
      const filtrados = materiales.filter(
        (material) => {
          const estaActivo = material.activo !== false;
          const tieneSaldoPendiente = material.cantidadPrestada > 0;
          
          return estaActivo && tieneSaldoPendiente;
        }
      );
      
      return filtrados;
    } else if (tipoMovimiento === "prestamo") {
      const filtrados = materiales.filter(
        (material) => {
          const esOriginal = material.esOriginal !== false;
          const tieneStockActivo = material.stocks && 
            material.stocks.some((stock: any) => stock.activo && stock.cantidad > 0);
          
          return esOriginal && tieneStockActivo;
        }
      );
      
      return filtrados;
    }
    
    return materiales;
  };

  const handleMaterialChange = (materialId: number) => {
    setMaterialSeleccionado(materialId);
    onMaterialChange(materialId);
  };

  const formFields: MovimientoFormField[] = [
    {
      name: "materialId",
      label: "Material",
      type: "select" as const,
      required: true,
      options: getMaterialesFiltrados().map((material) => ({
        value: material.id,
        label: crearEtiquetaMaterial(material),
      })),
      onChange: (value: number) => handleMaterialChange(value)
    },
    // Mostrar sitio destino solo para peticiones y préstamos
    ...(tipoMovimiento === "peticion" ||
    tipoMovimiento === "prestamo"
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
      : tipoMovimiento === "devolver" && sitioDestinoAutomatico
        ? [
            {
              name: "sitioDestinoInfo",
              label: "Sitio de Destino (Automático)",
              type: "text" as const,
              required: false,
              readOnly: true,
            },
          ]
        : []),
    // Campo cantidad solo para peticiones y préstamos
    ...(tipoMovimiento !== "devolver" ? [{
      name: "cantidad",
      label: "Cantidad",
      type: "number" as const,
      required: true,
    }] : []),
    // Campo observaciones solo para peticiones y préstamos
    ...(tipoMovimiento !== "devolver" ? [{
      name: "observaciones" as keyof Movimiento,
      label: "Observaciones",
      type: "text" as const,
      required: true,
    }] : []),
    ...(isAdmin
      ? [
          {
            name: "solicitanteId" as keyof Movimiento,
            label:
              tipoMovimiento === "peticion"
                ? "Solicitante"
                : tipoMovimiento === "prestamo"
                ? "Persona que recibe"
                : "Persona que devuelve",
            type: "select" as const,
            required: true,
            options: personas.map((persona) => ({
              value: persona.id,
              label: `${persona.nombre} ${persona.apellido || ""}`,
            })),
          },
       
      ] : []),
  ];

  const getInitialValues = () => {
    return {
      cantidad: 0,
      // Si no es administrador, pre-seleccionar el usuario actual
      ...(isAdmin ? {} : { solicitanteId: user?.usuario?.id }),
      // Valores iniciales para devoluciones
      ...(tipoMovimiento === "devolver" && sitioDestinoAutomatico ? {
        sitioDestinoInfo: sitios.find(s => s.id === sitioDestinoAutomatico)?.nombre || "Sitio de origen"
      } : {})
    };
  };

  if (!isOpen) return null;

  return (
    <GenericForm<Movimiento>
      fields={formFields as FieldDefinition<Movimiento>[]}
      initialValues={getInitialValues()}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

export default MovimientoForm;