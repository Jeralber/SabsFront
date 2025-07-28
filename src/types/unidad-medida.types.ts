import { Material } from './material.types';

export interface UnidadMedida {
  id: number;
  unidad: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  materiales?: Material[];
}