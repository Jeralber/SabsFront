import { Material } from './material.types';

export interface CategoriaMaterial {
  id: number;
  codigo: string;
  categoria: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  materiales?: Material[];
}