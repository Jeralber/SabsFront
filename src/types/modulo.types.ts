import { Opcion } from './opcion.types';

export interface Modulo {
  id: number;
  nombre: string;
  
  // Relaciones
  opciones?: Opcion[];
}