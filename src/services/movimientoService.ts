import axios from "@/lib/axios";
import { Movimiento, CreateMovimientoDto, AprobarMovimientoDto, MovimientoResponse, MovimientoListResponse } from '../types/movimiento.types';

const API_URL = '/movimientos';

export interface MovimientosFiltros {
  estado?: 'NO_APROBADO' | 'APROBADO' | 'RECHAZADO';
  materialId?: number;
  solicitanteId?: number;
  aprobadorId?: number;
  tipoMovimientoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export const movimientoService = {
  // Crear nuevo movimiento
  crear: async (data: CreateMovimientoDto): Promise<Movimiento> => {
    const response = await axios.post<MovimientoResponse>(API_URL, data);
    return response.data.data;
  },

  // Obtener todos los movimientos con filtros opcionales
  obtenerTodos: async (filtros?: MovimientosFiltros): Promise<Movimiento[]> => {
    let url = API_URL;
    if (filtros) {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    const response = await axios.get<MovimientoListResponse>(url);
    return response.data.data;
  },

  // Obtener movimientos pendientes de aprobación
  obtenerPendientes: async (): Promise<Movimiento[]> => {
    const response = await axios.get<MovimientoListResponse>(`${API_URL}/pendientes`);
    return response.data.data;
  },

  // Obtener movimiento por ID
  obtenerPorId: async (id: number): Promise<Movimiento> => {
    const response = await axios.get<MovimientoResponse>(`${API_URL}/${id}`);
    return response.data.data;
  },

  // Aprobar o rechazar movimiento
  aprobarRechazar: async (id: number, data: AprobarMovimientoDto): Promise<Movimiento> => {
    const response = await axios.patch<MovimientoResponse>(`${API_URL}/${id}/aprobar-rechazar`, data);
    return response.data.data;
  },

  // Métodos de conveniencia para aprobar/rechazar
  aprobar: async (id: number, aprobadorId: number, observaciones?: string): Promise<Movimiento> => {
    return movimientoService.aprobarRechazar(id, {
      estado: 'APROBADO',
      aprobadorId,
      observaciones
    });
  },

  rechazar: async (id: number, aprobadorId: number, observaciones?: string): Promise<Movimiento> => {
    return movimientoService.aprobarRechazar(id, {
      estado: 'RECHAZADO',
      aprobadorId,
      observaciones
    });
  }
};