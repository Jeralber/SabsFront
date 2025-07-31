import axios from "@/lib/axios";
import { Movimiento } from '../types/movimiento.types';

const API_URL = '/movimientos';

export interface MovimientosPaginados {
  data: Movimiento[];
  total: number;
  page: number;
  lastPage: number;
}

export const movimientoService = {
  crear: async (data: Partial<Movimiento>): Promise<Movimiento> => {
    const response = await axios.post<Movimiento>(API_URL, data);
    return response.data;
  },

  obtenerTodos: async (): Promise<Movimiento[]> => {
    const response = await axios.get<Movimiento[]>(API_URL);
    return response.data;
  },

  obtenerPorId: async (id: number): Promise<Movimiento> => {
    const response = await axios.get<Movimiento>(`${API_URL}/${id}`);
    return response.data;
  },

  actualizar: async (id: number, data: Partial<Movimiento>): Promise<Movimiento> => {
    const response = await axios.patch<Movimiento>(`${API_URL}/${id}`, data);
    return response.data;
  },

  eliminar: async (id: number): Promise<{ message: string }> => {
    const response = await axios.delete<{ message: string }>(`${API_URL}/${id}`);
    return response.data;
  },



  crearDesdeSolicitud: async (params: {
    materialId: number;
    cantidad: number;
    personaId: number;
    tipoMovimientoNombre: string;
    solicitudId?: number;
  }): Promise<Movimiento> => {
    const response = await axios.post<Movimiento>(`${API_URL}/desde-solicitud`, params);
    return response.data;
  },
  
  crearConSolicitud: async (data: Partial<Movimiento> & { solicitudId?: number }): Promise<{
    message: string;
    data: {
      movimiento: Movimiento;
      solicitud: any;
      detalle: any;
    };
  }> => {
    const response = await axios.post(`${API_URL}`, data);
    return response.data;
  }
};