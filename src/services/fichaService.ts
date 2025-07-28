import axios from "@/lib/axios";
import { Ficha } from '../types/ficha.types';

const API_URL = '/fichas';

export interface FichaResponse {
  message: string;
  data: Ficha | Ficha[] | null;
}

export const fichaService = {
  getAll: async (): Promise<FichaResponse> => {
    const response = await axios.get<FichaResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<FichaResponse> => {
    const response = await axios.get<FichaResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (ficha: Partial<Ficha>): Promise<FichaResponse> => {
    const response = await axios.post<FichaResponse>(API_URL, ficha);
    return response.data;
  },

  update: async (id: number, ficha: Partial<Ficha>): Promise<FichaResponse> => {
    const response = await axios.patch<FichaResponse>(`${API_URL}/${id}`, ficha);
    return response.data;
  },

  delete: async (id: number): Promise<FichaResponse> => {
    const response = await axios.delete<FichaResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};