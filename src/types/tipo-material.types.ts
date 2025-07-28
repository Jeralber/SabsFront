import { Material } from './material.types';

export interface TipoMaterial {
  id: number;
  tipo: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  materiales?: Material[];
}