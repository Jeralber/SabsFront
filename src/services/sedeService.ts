import axios from "@/lib/axios";
import { Sede } from '../types/sede.types';

const API_URL = '/sedes';

export interface SedeResponse {
  message: string;
  data: Sede | Sede[] | null;
}

export const sedeService = {
  getAll: async (): Promise<SedeResponse> => {
    const response = await axios.get<SedeResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<SedeResponse> => {
    const response = await axios.get<SedeResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (sede: Partial<Sede>): Promise<SedeResponse> => {
    const response = await axios.post<SedeResponse>(API_URL, sede);
    return response.data;
  },

  update: async (id: number, sede: Partial<Sede>): Promise<SedeResponse> => {
    const response = await axios.patch<SedeResponse>(`${API_URL}/${id}`, sede);
    return response.data;
  },

  delete: async (id: number): Promise<SedeResponse> => {
    const response = await axios.delete<SedeResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};