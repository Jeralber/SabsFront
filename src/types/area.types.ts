import { AreaCentro } from './area-centro.types';
import { Titulado } from './titulado.types';

export interface Area {
  id: number;
  nombre: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  areasCentro?: AreaCentro[];
  titulados?: Titulado[];
}