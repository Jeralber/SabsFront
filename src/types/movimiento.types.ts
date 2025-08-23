import { TipoMovimiento } from './tipo-movimiento.types';
import { Persona } from './persona.types';
import { Material } from './material.types';
import { Solicitud } from './solicitud.types';
import { Detalles } from './detalles.types';
import { Sitio } from './sitio.types';

export interface Movimiento {
  id: number;
  cantidad: number;
  materialId: number;
  tipoMovimientoId: number;
  personaId: number;
  solicitudId?: number;
  detalleId?: number;
  activo: boolean;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ENTREGADO' | 'DEVUELTO';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  descripcion?: string;
  sitios?: Sitio[];
  
  // Relaciones
  material: Material;
  tipoMovimiento: TipoMovimiento;
  persona: Persona;
  solicitud?: Solicitud;
  detalle?: Detalles;
  sitio?: Sitio;
}