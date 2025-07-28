import { Sitio } from './sitio.types';

export interface TipoSitio {
  id: number;
  nombre: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  sitios?: Sitio[];
}