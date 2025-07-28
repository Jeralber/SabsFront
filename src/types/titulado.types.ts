import { Area } from './area.types';
import { Ficha } from './ficha.types';

export interface Titulado {
  id: number;
  nombre: string;
  areaId?: number;
  fichaId?: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  area?: Area;
  ficha?: Ficha;
}