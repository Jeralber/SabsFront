import axios from "@/lib/axios";
import { Opcion } from '../types/opcion.types';

const API_URL = '/opciones';

export interface OpcionResponse {
  message: string;
  data: Opcion | Opcion[] | null;
}

export const opcionService = {
  getAll: async (): Promise<OpcionResponse> => {
    const response = await axios.get<OpcionResponse>(API_URL);
    return response.data;
  },

  getAllWithPermisos: async (): Promise<OpcionResponse> => {
    const response = await axios.get<OpcionResponse>(`${API_URL}/full`);
    return response.data;
  },

  getById: async (id: number): Promise<OpcionResponse> => {
    const response = await axios.get<OpcionResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (opcion: Partial<Opcion>): Promise<OpcionResponse> => {
    const response = await axios.post<OpcionResponse>(API_URL, opcion);
    return response.data;
  },

  update: async (id: number, opcion: Partial<Opcion>): Promise<OpcionResponse> => {
    const response = await axios.patch<OpcionResponse>(`${API_URL}/${id}`, opcion);
    return response.data;
  },

  delete: async (id: number): Promise<OpcionResponse> => {
    const response = await axios.delete<OpcionResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};