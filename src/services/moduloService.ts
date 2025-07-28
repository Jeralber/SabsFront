import axios from "@/lib/axios";
import { Modulo } from '../types/modulo.types';

const API_URL = '/modulos';

export interface ModuloResponse {
  message: string;
  data: Modulo | Modulo[] | null;
}

export const moduloService = {
  getAll: async (): Promise<ModuloResponse> => {
    const response = await axios.get<ModuloResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<ModuloResponse> => {
    const response = await axios.get<ModuloResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (modulo: Partial<Modulo>): Promise<ModuloResponse> => {
    const response = await axios.post<ModuloResponse>(API_URL, modulo);
    return response.data;
  },

  update: async (id: number, modulo: Partial<Modulo>): Promise<ModuloResponse> => {
    const response = await axios.patch<ModuloResponse>(`${API_URL}/${id}`, modulo);
    return response.data;
  },

  delete: async (id: number): Promise<ModuloResponse> => {
    const response = await axios.delete<ModuloResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};