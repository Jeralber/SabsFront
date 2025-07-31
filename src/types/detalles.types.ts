import { Material } from './material.types';
import { Solicitud } from './solicitud.types';
import { Persona } from './persona.types';
import { Movimiento } from './movimiento.types';

export interface Detalles {
  id: number;
  cantidad: number;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ENTREGADO' | 'DEVUELTO';
  materialId: number;
  solicitudId: number;
  personaApruebaId?: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // Relaciones
  material: Material;
  solicitud: Solicitud;
  personaAprueba?: Persona;
  movimiento?: Movimiento;
}