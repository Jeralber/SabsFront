import axios from "@/lib/axios";
import { CategoriaMaterial } from '../types/categoria-material.types';

const API_URL = '/categoriamateriales';

export interface CategoriaMaterialResponse {
  message: string;
  data: CategoriaMaterial | CategoriaMaterial[] | null;
}

export const categoriaMaterialService = {
  getAll: async (): Promise<CategoriaMaterialResponse> => {
    const response = await axios.get<CategoriaMaterialResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<CategoriaMaterialResponse> => {
    const response = await axios.get<CategoriaMaterialResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (categoriaMaterial: Partial<CategoriaMaterial>): Promise<CategoriaMaterialResponse> => {
    const response = await axios.post<CategoriaMaterialResponse>(API_URL, categoriaMaterial);
    return response.data;
  },

  update: async (id: number, categoriaMaterial: Partial<CategoriaMaterial>): Promise<CategoriaMaterialResponse> => {
    const response = await axios.patch<CategoriaMaterialResponse>(`${API_URL}/${id}`, categoriaMaterial);
    return response.data;
  },

  delete: async (id: number): Promise<CategoriaMaterialResponse> => {
    const response = await axios.delete<CategoriaMaterialResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};