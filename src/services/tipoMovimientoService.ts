import axios from "@/lib/axios";
import { TipoMovimiento } from '../types/tipo-movimiento.types';

const API_URL = '/tipomovimientos';

export interface TipoMovimientoResponse {
  message: string;
  data: TipoMovimiento | TipoMovimiento[] | null;
}

export const tipoMovimientoService = {
  getAll: async (): Promise<TipoMovimientoResponse> => {
    const response = await axios.get<TipoMovimientoResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<TipoMovimientoResponse> => {
    const response = await axios.get<TipoMovimientoResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (tipoMovimiento: Partial<TipoMovimiento>): Promise<TipoMovimientoResponse> => {
    const response = await axios.post<TipoMovimientoResponse>(API_URL, tipoMovimiento);
    return response.data;
  },

  update: async (id: number, tipoMovimiento: Partial<TipoMovimiento>): Promise<TipoMovimientoResponse> => {
    const response = await axios.patch<TipoMovimientoResponse>(`${API_URL}/${id}`, tipoMovimiento);
    return response.data;
  },

  delete: async (id: number): Promise<TipoMovimientoResponse> => {
    const response = await axios.delete<TipoMovimientoResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};