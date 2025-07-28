import { Centro } from './centro.types';
import { Area } from './area.types';

export interface AreaCentro {
  id: number;
  centroId?: number;
  areaId?: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  centro?: Centro;
  area?: Area;
}