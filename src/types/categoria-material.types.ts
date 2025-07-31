import { Material } from './material.types';

export interface CategoriaMaterial {
  id: number;
  categoria: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  materiales?: Material[];
}