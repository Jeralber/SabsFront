import axios from "@/lib/axios";
import { Centro } from '../types/centro.types';

const API_URL = '/centros';

export interface CentroResponse {
  message: string;
  data: Centro | Centro[] | null;
}

export const centroService = {
  getAll: async (): Promise<CentroResponse> => {
    const response = await axios.get<CentroResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<CentroResponse> => {
    const response = await axios.get<CentroResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (centro: Partial<Centro>): Promise<CentroResponse> => {
    const response = await axios.post<CentroResponse>(API_URL, centro);
    return response.data;
  },

  update: async (id: number, centro: Partial<Centro>): Promise<CentroResponse> => {
    const response = await axios.patch<CentroResponse>(`${API_URL}/${id}`, centro);
    return response.data;
  },

  delete: async (id: number): Promise<CentroResponse> => {
    const response = await axios.delete<CentroResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};