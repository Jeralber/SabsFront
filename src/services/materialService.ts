import axios from "@/lib/axios";
import { Material } from "../types/material.types";

const API_URL = "/materiales";

export interface MaterialResponse {
  message: string;
  data: Material | Material[] | null;
}

export const materialService = {
  getAll: async (): Promise<MaterialResponse> => {
    // ✅ MEJORADO: Timestamp más agresivo y headers para evitar cache
    const timestamp = Date.now() + Math.random();
    const response = await axios.get<MaterialResponse>(
      `${API_URL}?_t=${timestamp}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    return response.data;
  },

  getById: async (id: number): Promise<MaterialResponse> => {
    const timestamp = new Date().getTime();
    const response = await axios.get<MaterialResponse>(
      `${API_URL}/${id}?_t=${timestamp}`
    );
    return response.data;
  },

  getBySitio: async (sitioId: number): Promise<MaterialResponse> => {
    const timestamp = new Date().getTime();
    const response = await axios.get<MaterialResponse>(
      `${API_URL}?sitioId=${sitioId}&_t=${timestamp}`
    );
    return response.data;
  },

  getStock: async (): Promise<Material[]> => {
    const timestamp = new Date().getTime();
    const response = await axios.get<Material[]>(
      `${API_URL}/stock?_t=${timestamp}`
    );
    return response.data;
  },

  create: async (material: Partial<Material>): Promise<MaterialResponse> => {
    const response = await axios.post<MaterialResponse>(API_URL, material);
    return response.data;
  },

  update: async (
    id: number,
    material: Partial<Material>
  ): Promise<MaterialResponse> => {
    const response = await axios.patch<MaterialResponse>(
      `${API_URL}/${id}`,
      material
    );
    return response.data;
  },

  delete: async (id: number): Promise<MaterialResponse> => {
    const response = await axios.delete<MaterialResponse>(`${API_URL}/${id}`);
    return response.data;
  },
};
