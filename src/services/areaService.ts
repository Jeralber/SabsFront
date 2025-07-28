import axios from "@/lib/axios";
import { Area } from '../types/area.types';

const API_URL = '/areas';

export interface AreaResponse {
  message: string;
  data: Area | Area[] | null;
}

export const areaService = {
  getAll: async (): Promise<AreaResponse> => {
    const response = await axios.get<AreaResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<AreaResponse> => {
    const response = await axios.get<AreaResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (area: Partial<Area>): Promise<AreaResponse> => {
    const response = await axios.post<AreaResponse>(API_URL, area);
    return response.data;
  },

  update: async (id: number, area: Partial<Area>): Promise<AreaResponse> => {
    const response = await axios.patch<AreaResponse>(`${API_URL}/${id}`, area);
    return response.data;
  },

  delete: async (id: number): Promise<AreaResponse> => {
    const response = await axios.delete<AreaResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};