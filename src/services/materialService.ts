import axios from "@/lib/axios";
import { Material } from '../types/material.types';

const API_URL = '/materiales';

export interface MaterialResponse {
  message: string;
  data: Material | Material[] | null;
}

export const materialService = {
  getAll: async (): Promise<MaterialResponse> => {
    const response = await axios.get<MaterialResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<MaterialResponse> => {
    const response = await axios.get<MaterialResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  getBySitio: async (sitioId: number): Promise<MaterialResponse> => {
    const response = await axios.get<MaterialResponse>(`${API_URL}?sitioId=${sitioId}`);
    return response.data;
  },

  getStock: async (): Promise<Material[]> => {
    const response = await axios.get<Material[]>(`${API_URL}/stock`);
    return response.data;
  },

  create: async (material: Partial<Material>): Promise<MaterialResponse> => {
    const response = await axios.post<MaterialResponse>(API_URL, material);
    return response.data;
  },

  update: async (id: number, material: Partial<Material>): Promise<MaterialResponse> => {
    const response = await axios.patch<MaterialResponse>(`${API_URL}/${id}`, material);
    return response.data;
  },

  delete: async (id: number): Promise<MaterialResponse> => {
    const response = await axios.delete<MaterialResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};