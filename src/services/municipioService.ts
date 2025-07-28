import axios from "@/lib/axios";
import { Municipio } from '../types/municipio.types';

const API_URL = '/municipios';

export interface MunicipioResponse {
  message: string;
  data: Municipio | Municipio[] | null;
}

export const municipioService = {
  getAll: async (): Promise<MunicipioResponse> => {
    const response = await axios.get<MunicipioResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<MunicipioResponse> => {
    const response = await axios.get<MunicipioResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (municipio: Partial<Municipio>): Promise<MunicipioResponse> => {
    const response = await axios.post<MunicipioResponse>(API_URL, municipio);
    return response.data;
  },

  update: async (id: number, municipio: Partial<Municipio>): Promise<MunicipioResponse> => {
    const response = await axios.patch<MunicipioResponse>(`${API_URL}/${id}`, municipio);
    return response.data;
  },

  delete: async (id: number): Promise<MunicipioResponse> => {
    const response = await axios.delete<MunicipioResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};