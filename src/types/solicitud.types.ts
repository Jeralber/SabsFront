import { Persona } from './persona.types';
import { Detalles } from './detalles.types';
import { Movimiento } from './movimiento.types';

export interface Solicitud {
  id: number;
  descripcion: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'ENTREGADA' | 'DEVUELTA';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // Relaciones
  solicitante: Persona;
  aprobador?: Persona;
  encargadoEntrega?: Persona;
  detalles: Detalles[];
  movimientos: Movimiento[];
}