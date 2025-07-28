import axios from "@/lib/axios";
import { Sitio } from '../types/sitio.types';

const API_URL = '/sitios';

export interface SitioResponse {
  message: string;
  data: Sitio | Sitio[] | null;
}

export const sitioService = {
  getAll: async (): Promise<SitioResponse> => {
    const response = await axios.get<SitioResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<SitioResponse> => {
    const response = await axios.get<SitioResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (sitio: Partial<Sitio>): Promise<SitioResponse> => {
    const response = await axios.post<SitioResponse>(API_URL, sitio);
    return response.data;
  },

  update: async (id: number, sitio: Partial<Sitio>): Promise<SitioResponse> => {
    const response = await axios.patch<SitioResponse>(`${API_URL}/${id}`, sitio);
    return response.data;
  },

  delete: async (id: number): Promise<SitioResponse> => {
    const response = await axios.delete<SitioResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};