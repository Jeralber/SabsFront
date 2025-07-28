import axios from "@/lib/axios";
import { Movimiento } from '../types/movimiento.types';


const API_URL = '/movimientos';

export interface MovimientoResponse {
  message: string;
  data: Movimiento | Movimiento[] | null;
}

export interface MovimientosPaginados {
  data: Movimiento[];
  total: number;
  page: number;
  lastPage: number;
}

export const movimientoService = {
  getAll: async (): Promise<MovimientoResponse> => {
    const response = await axios.get<MovimientoResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<MovimientoResponse> => {
    const response = await axios.get<MovimientoResponse>(`${API_URL}/${id}`);
    return response.data;
  },



  create: async (movimiento: Partial<Movimiento>): Promise<MovimientoResponse> => {
    const response = await axios.post<MovimientoResponse>(API_URL, movimiento);
    return response.data;
  },

  update: async (id: number, movimiento: Partial<Movimiento>): Promise<MovimientoResponse> => {
    const response = await axios.patch<MovimientoResponse>(`${API_URL}/${id}`, movimiento);
    return response.data;
  },

  delete: async (id: number): Promise<MovimientoResponse> => {
    const response = await axios.delete<MovimientoResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};