import axios from "@/lib/axios";
import { AreaCentro } from '../types/area-centro.types';

const API_URL = '/areacentros';

export interface AreaCentroResponse {
  message: string;
  data: AreaCentro | AreaCentro[] | null;
}

export const areacentroService = {
  getAll: async (): Promise<AreaCentroResponse> => {
    const response = await axios.get<AreaCentroResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<AreaCentroResponse> => {
    const response = await axios.get<AreaCentroResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (areaCentro: Partial<AreaCentro>): Promise<AreaCentroResponse> => {
    const response = await axios.post<AreaCentroResponse>(API_URL, areaCentro);
    return response.data;
  },

  update: async (id: number, areaCentro: Partial<AreaCentro>): Promise<AreaCentroResponse> => {
    const response = await axios.patch<AreaCentroResponse>(`${API_URL}/${id}`, areaCentro);
    return response.data;
  },

  delete: async (id: number): Promise<AreaCentroResponse> => {
    const response = await axios.delete<AreaCentroResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};