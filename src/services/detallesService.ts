import axios from "@/lib/axios";
import { Detalles, DetallesFiltros, DetallesResponse, DetallesListResponse, EstadisticasDetalles } from '../types/detalles.types';

const API_URL = '/detalles';

export const detallesService = {
  // Obtener todos los detalles con filtros opcionales
  obtenerTodos: async (filtros?: DetallesFiltros): Promise<Detalles[]> => {
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
    const response = await axios.get<DetallesListResponse>(url);
    return response.data.data;
  },

  // Obtener detalle por ID
  obtenerPorId: async (id: number): Promise<Detalles> => {
    const response = await axios.get<DetallesResponse>(`${API_URL}/${id}`);
    return response.data.data;
  },

  // Obtener detalles por estado
  obtenerPorEstado: async (estado: 'NO_APROBADO' | 'APROBADO' | 'RECHAZADO'): Promise<Detalles[]> => {
    const response = await axios.get<DetallesListResponse>(`${API_URL}/estado/${estado}`);
    return response.data.data;
  },

  // Obtener detalles por movimiento
  obtenerPorMovimiento: async (movimientoId: number): Promise<Detalles[]> => {
    const response = await axios.get<DetallesListResponse>(`${API_URL}/movimiento/${movimientoId}`);
    return response.data.data;
  },

  // Obtener historial de un material
  obtenerHistorialMaterial: async (materialId: number): Promise<Detalles[]> => {
    const response = await axios.get<DetallesListResponse>(`${API_URL}/material/${materialId}/historial`);
    return response.data.data;
  },

  // Obtener estadísticas
  obtenerEstadisticas: async (): Promise<EstadisticasDetalles> => {
    const response = await axios.get<{message: string, data: EstadisticasDetalles}>(`${API_URL}/estadisticas`);
    return response.data.data;
  }
};