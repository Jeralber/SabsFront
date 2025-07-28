import axios from "@/lib/axios";
import { Detalles } from '../types/detalles.types';

const API_URL = '/detalles';

export interface DetallesResponse {
  message: string;
  data: Detalles | Detalles[] | null;
}

export const detallesService = {
  getAll: async (): Promise<DetallesResponse> => {
    const response = await axios.get<DetallesResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<DetallesResponse> => {
    const response = await axios.get<DetallesResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (detalle: Partial<Detalles>): Promise<DetallesResponse> => {
    const response = await axios.post<DetallesResponse>(API_URL, detalle);
    return response.data;
  },

  update: async (id: number, detalle: Partial<Detalles>): Promise<DetallesResponse> => {
    const response = await axios.patch<DetallesResponse>(`${API_URL}/${id}`, detalle);
    return response.data;
  },

  delete: async (id: number): Promise<DetallesResponse> => {
    const response = await axios.delete<DetallesResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};