import { Municipio } from './municipio.types';
import { AreaCentro } from './area-centro.types';
import { Sede } from './sede.types';

export interface Centro {
  id: number;
  nombre: string;
  municipioId?: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  sede?: Sede;
  // Relaciones
  municipio?: Municipio;
  areasCentro?: AreaCentro[];
  sedes?: Sede[];  
}