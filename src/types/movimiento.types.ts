import { TipoMovimiento } from './tipo-movimiento.types';
import { Persona } from './persona.types';
import { Material } from './material.types';
import { Solicitud } from './solicitud.types';
import { Detalles } from './detalles.types';

// Asegúrate de que el tipo Movimiento incluya descripcion
export interface Movimiento {
  id: number;
  cantidad: number;
  materialId: number;
  tipoMovimientoId: number;
  personaId: number;
  solicitudId?: number;
  detalleId?: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // Relaciones
  material: Material;
  tipoMovimiento: TipoMovimiento;
  persona: Persona;
  solicitud?: Solicitud;
  detalle?: Detalles;
}