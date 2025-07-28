import { Centro } from './centro.types';

export interface Municipio {
  id: number;
  nombre: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  centros?: Centro[];
}