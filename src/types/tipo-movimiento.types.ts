import { Movimiento } from './movimiento.types';

export interface TipoMovimiento {
  id: number;
  nombre: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  movimientos?: Movimiento[];
}