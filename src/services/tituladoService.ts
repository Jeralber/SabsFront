import axios from "@/lib/axios";
import { Titulado } from '../types/titulado.types';

const API_URL = '/titulados';

export interface TituladoResponse {
  message: string;
  data: Titulado | Titulado[] | null;
}

export const tituladoService = {
  getAll: async (): Promise<TituladoResponse> => {
    const response = await axios.get<TituladoResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<TituladoResponse> => {
    const response = await axios.get<TituladoResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (titulado: Partial<Titulado>): Promise<TituladoResponse> => {
    const response = await axios.post<TituladoResponse>(API_URL, titulado);
    return response.data;
  },

  update: async (id: number, titulado: Partial<Titulado>): Promise<TituladoResponse> => {
    const response = await axios.patch<TituladoResponse>(`${API_URL}/${id}`, titulado);
    return response.data;
  },

  delete: async (id: number): Promise<TituladoResponse> => {
    const response = await axios.delete<TituladoResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};