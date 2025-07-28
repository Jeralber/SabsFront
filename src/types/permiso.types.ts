import { Opcion } from './opcion.types';
import { RolPermisoOpcion } from './rol-permiso-opcion.types';

export interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  opcionId?: number;
  
  // Relaciones
  opcion?: Opcion;
  rolesPermisosOpciones?: RolPermisoOpcion[];
}