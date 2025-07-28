import { Modulo } from './modulo.types';
import { Permiso } from './permiso.types';
import { RolPermisoOpcion } from './rol-permiso-opcion.types';

export interface Opcion {
  id: number;
  nombre: string;
  descripcion?: string;
  rutaFrontend: string;
  moduloId: number;
  
  // Relaciones
  modulo: Modulo;
  permisos?: Permiso[];
  rolesPermisosOpciones?: RolPermisoOpcion[];
}