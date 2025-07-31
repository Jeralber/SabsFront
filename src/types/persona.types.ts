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


export interface PersonaCompleta {

  personaId: number;
  identificacion: string;
  personaNombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  edad: number;
  personaActiva: boolean;
  

  rolId?: number;
  rolNombre?: string;
  

  fichaId?: number;
  fichaNumero?: string;
  cantidadAprendices?: number;
 
  tituladoId?: number;
  tituladoNombre?: string;
  

  areaId?: number;
  areaNombre?: string;
  

  centroId?: number;
  centroNombre?: string;
  

  sedeId?: number;
  sedeNombre?: string;
  sedeDireccion?: string;
  
  municipioId?: number;
  municipioNombre?: string;
}

export interface PersonaCompletaResponse {
  message: string;
  data: PersonaCompleta | PersonaCompleta[];
}