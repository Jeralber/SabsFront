import axios from "@/lib/axios";
import { UnidadMedida } from '../types/unidad-medida.types';

const API_URL = '/unidadmedidas';

export interface UnidadMedidaResponse {
  message: string;
  data: UnidadMedida | UnidadMedida[] | null;
}

export const unidadMedidaService = {
  getAll: async (): Promise<UnidadMedidaResponse> => {
    const response = await axios.get<UnidadMedidaResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<UnidadMedidaResponse> => {
    const response = await axios.get<UnidadMedidaResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (unidadMedida: Partial<UnidadMedida>): Promise<UnidadMedidaResponse> => {
    const response = await axios.post<UnidadMedidaResponse>(API_URL, unidadMedida);
    return response.data;
  },

  update: async (id: number, unidadMedida: Partial<UnidadMedida>): Promise<UnidadMedidaResponse> => {
    const response = await axios.patch<UnidadMedidaResponse>(`${API_URL}/${id}`, unidadMedida);
    return response.data;
  },

  delete: async (id: number): Promise<UnidadMedidaResponse> => {
    const response = await axios.delete<UnidadMedidaResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};