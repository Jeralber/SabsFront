import { Persona } from './persona.types';
import { Titulado } from './titulado.types';

export interface Ficha {
  id: number;
  numero: number;
  cantidadAprendices?: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  personas?: Persona[];
  titulados?: Titulado[];
}