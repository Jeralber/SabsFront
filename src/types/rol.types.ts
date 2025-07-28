import { Persona } from './persona.types';
import { RolPermisoOpcion } from './rol-permiso-opcion.types';

export interface Rol {
  id: number;
  nombre: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  
  // Relaciones
  personas?: Persona[];
  rolesPermisosOpciones?: RolPermisoOpcion[];
}