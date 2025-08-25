import { Material } from './material.types';
import { Solicitud } from './solicitud.types';
import { Persona } from './persona.types';
import { Movimiento } from './movimiento.types';

export interface Detalles {
  id: number;
  cantidad: number;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'PRESTADO' | 'DEVUELTO' | 'CONSUMIDO';
  materialId: number;
  solicitudId: number;
  personaApruebaId?: number;
  // Nuevos campos
  numeroFactura?: string;
  accion?: string;
  solicitanteId?: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // Relaciones
  material: Material;
  solicitud: Solicitud;
  personaAprueba?: Persona;
  solicitante?: Persona; // Nueva relación
  movimiento?: Movimiento;
}