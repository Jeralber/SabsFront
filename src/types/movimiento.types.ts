import { TipoMovimiento } from './tipo-movimiento.types';
import { Persona } from './persona.types';
import { Material } from './material.types';
import { Solicitud } from './solicitud.types';

export interface Movimiento {
  id: number;
  tipoMovimientoId?: number;
  personaId?: number;
  cantidad: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  materialId: number;
  
  // Relaciones
  material: Material;
  tipoMovimiento?: TipoMovimiento;
  persona?: Persona;
  solicitud: Solicitud;
}