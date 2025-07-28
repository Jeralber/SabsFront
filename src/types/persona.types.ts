import { Rol } from './rol.types';
import { Ficha } from './ficha.types';
import { Detalles } from './detalles.types';
import { Movimiento } from './movimiento.types';

export interface Persona {
  id: number;
  identificacion: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  contrasena: string;
  edad: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  rolId?: number;
  fichaId?: number;
  
  // Relaciones
  rol?: Rol;
  ficha?: Ficha;
  encargos?: Detalles[];
  solicitudes?: Detalles[];
  aprobaciones?: Detalles[];
  movimientos?: Movimiento[];
}