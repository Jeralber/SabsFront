import axios from "@/lib/axios";
import { Permiso } from '../types/permiso.types';

const API_URL = '/permisos';

export interface PermisoResponse {
  message: string;
  data: Permiso | Permiso[] | null;
}

export const permisoService = {
  getAll: async (): Promise<PermisoResponse> => {
    const response = await axios.get<PermisoResponse>(API_URL);
    return response.data;
  },

  getAllWithOpcionYModulo: async (): Promise<PermisoResponse> => {
    const response = await axios.get<PermisoResponse>(`${API_URL}/full`);
    return response.data;
  },

  getById: async (id: number): Promise<PermisoResponse> => {
    const response = await axios.get<PermisoResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (permiso: Partial<Permiso>): Promise<PermisoResponse> => {
    const response = await axios.post<PermisoResponse>(API_URL, permiso);
    return response.data;
  },

  update: async (id: number, permiso: Partial<Permiso>): Promise<PermisoResponse> => {
    const response = await axios.patch<PermisoResponse>(`${API_URL}/${id}`, permiso);
    return response.data;
  },

  delete: async (id: number): Promise<PermisoResponse> => {
    const response = await axios.delete<PermisoResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};