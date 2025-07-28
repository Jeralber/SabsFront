import { TipoSitio } from './tipo-sitio.types';

export interface Sitio {
  id: number;
  nombre: string;
  tipoSitioId?: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  tipoSitio?: TipoSitio;
}