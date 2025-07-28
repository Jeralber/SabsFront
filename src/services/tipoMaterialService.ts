import axios from "@/lib/axios";
import { TipoMaterial } from '../types/tipo-material.types';

const API_URL = '/tipomateriales';

export interface TipoMaterialResponse {
  message: string;
  data: TipoMaterial | TipoMaterial[] | null;
}

export const tipoMaterialService = {
  getAll: async (): Promise<TipoMaterialResponse> => {
    const response = await axios.get<TipoMaterialResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<TipoMaterialResponse> => {
    const response = await axios.get<TipoMaterialResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (tipoMaterial: Partial<TipoMaterial>): Promise<TipoMaterialResponse> => {
    const response = await axios.post<TipoMaterialResponse>(API_URL, tipoMaterial);
    return response.data;
  },

  update: async (id: number, tipoMaterial: Partial<TipoMaterial>): Promise<TipoMaterialResponse> => {
    const response = await axios.patch<TipoMaterialResponse>(`${API_URL}/${id}`, tipoMaterial);
    return response.data;
  },

  delete: async (id: number): Promise<TipoMaterialResponse> => {
    const response = await axios.delete<TipoMaterialResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};