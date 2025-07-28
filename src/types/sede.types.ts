import { Centro } from './centro.types';

export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  centroId?: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  centro?: Centro;
}