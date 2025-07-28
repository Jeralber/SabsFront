import { Rol } from './rol.types';
import { Permiso } from './permiso.types';
import { Opcion } from './opcion.types';

export interface RolPermisoOpcion {
  id: number;
  rolId?: number;
  permisoId?: number;
  opcionId?: number;
  
  // Relaciones
  rol?: Rol;
  permiso?: Permiso;
  opcion?: Opcion;
}