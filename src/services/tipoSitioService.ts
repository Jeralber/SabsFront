import axios from "@/lib/axios";
import { TipoSitio } from '../types/tipo-sitio.types';

const API_URL = '/tipositios';

export interface TipoSitioResponse {
  message: string;
  data: TipoSitio | TipoSitio[] | null;
}

export const tipoSitioService = {
  getAll: async (): Promise<TipoSitioResponse> => {
    const response = await axios.get<TipoSitioResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<TipoSitioResponse> => {
    const response = await axios.get<TipoSitioResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (tipoSitio: Partial<TipoSitio>): Promise<TipoSitioResponse> => {
    const response = await axios.post<TipoSitioResponse>(API_URL, tipoSitio);
    return response.data;
  },

  update: async (id: number, tipoSitio: Partial<TipoSitio>): Promise<TipoSitioResponse> => {
    const response = await axios.patch<TipoSitioResponse>(`${API_URL}/${id}`, tipoSitio);
    return response.data;
  },

  delete: async (id: number): Promise<TipoSitioResponse> => {
    const response = await axios.delete<TipoSitioResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};