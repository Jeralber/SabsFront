import axios from "@/lib/axios";
import { RolPermisoOpcion } from '../types/rol-permiso-opcion.types';

const API_URL = '/rol-permiso-opcion';

export interface RolPermisoOpcionResponse {
  message: string;
  data: RolPermisoOpcion | RolPermisoOpcion[] | null;
}

export interface PermisoDisponible {
  id: number;
  nombre: string;
  opcionId?: number;
  opcionNombre?: string;
}

export interface PermisosDisponiblesResponse {
  message: string;
  data: PermisoDisponible[];
}

export const rolPermisoOpcionService = {
  getAll: async (): Promise<RolPermisoOpcionResponse> => {
    const response = await axios.get<RolPermisoOpcionResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<RolPermisoOpcionResponse> => {
    const response = await axios.get<RolPermisoOpcionResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (rolPermisoOpcion: Partial<RolPermisoOpcion>): Promise<RolPermisoOpcionResponse> => {
    const response = await axios.post<RolPermisoOpcionResponse>(API_URL, rolPermisoOpcion);
    return response.data;
  },

  update: async (id: number, rolPermisoOpcion: Partial<RolPermisoOpcion>): Promise<RolPermisoOpcionResponse> => {
    const response = await axios.patch<RolPermisoOpcionResponse>(`${API_URL}/${id}`, rolPermisoOpcion);
    return response.data;
  },

  delete: async (id: number): Promise<RolPermisoOpcionResponse> => {
    const response = await axios.delete<RolPermisoOpcionResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  // Nuevos métodos basados en tus endpoints
  getPermisosByRol: async (rolId: number): Promise<RolPermisoOpcionResponse> => {
    const response = await axios.get<RolPermisoOpcionResponse>(`${API_URL}/rol/${rolId}`);
    return response.data;
  },

  asignarPermisosARol: async (rolId: number, permisosData: { permisoId: number, opcionId?: number }[]): Promise<RolPermisoOpcionResponse> => {
    const response = await axios.post<RolPermisoOpcionResponse>(`${API_URL}/asignar-permisos/${rolId}`, permisosData);
    return response.data;
  },

  getPermisosDisponibles: async (): Promise<PermisosDisponiblesResponse> => {
    const response = await axios.get<PermisosDisponiblesResponse>(`${API_URL}/permisos-disponibles`);
    return response.data;
  }
};