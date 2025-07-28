import axios from "@/lib/axios";
import { Rol } from '../types/rol.types';

const API_URL = '/roles';

export interface RolResponse {
  message: string;
  data: Rol | Rol[] | null;
}

export const rolService = {
  getAll: async (): Promise<RolResponse> => {
    const response = await axios.get<RolResponse>(API_URL);
    return response.data;
  },

  getAllWithPermisosYOpciones: async (): Promise<RolResponse> => {
    const response = await axios.get<RolResponse>(`${API_URL}/full`);
    return response.data;
  },

  getById: async (id: number): Promise<RolResponse> => {
    const response = await axios.get<RolResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (rol: Partial<Rol>): Promise<RolResponse> => {
    const response = await axios.post<RolResponse>(API_URL, rol);
    return response.data;
  },

  update: async (id: number, rol: Partial<Rol>): Promise<RolResponse> => {
    const response = await axios.patch<RolResponse>(`${API_URL}/${id}`, rol);
    return response.data;
  },

  delete: async (id: number): Promise<RolResponse> => {
    const response = await axios.delete<RolResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};