import axios from "@/lib/axios";
import { Detalles, DetallesFiltros, DetallesResponse, DetallesListResponse } from '../types/detalles.types';

const API_URL = '/detalles';

// DTO para crear detalle
export interface CreateDetalleDto {
  movimientoId: number;
  materialId: number;
  cantidad: number;
  personaSolicitaId?: number;
}

// DTO para actualizar detalle
export interface UpdateDetalleDto {
  cantidad?: number;
  estado?: string;
  personaApruebaId?: number;
}

export const detallesService = {
  // Crear nuevo detalle
  crear: async (dto: CreateDetalleDto): Promise<Detalles> => {
    const response = await axios.post<DetallesResponse>(API_URL, dto);
    return response.data.data;
  },

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

  // Actualizar detalle
  actualizar: async (id: number, dto: UpdateDetalleDto): Promise<Detalles> => {
    const response = await axios.patch<DetallesResponse>(`${API_URL}/${id}`, dto);
    return response.data.data;
  },

  // Eliminar detalle
  eliminar: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  // Métodos adicionales que pueden implementarse en el backend más adelante
  // (mantenidos para compatibilidad con el frontend actual)
  
  // Obtener detalles por estado
  obtenerPorEstado: async (estado: string): Promise<Detalles[]> => {
    const response = await axios.get<DetallesListResponse>(`${API_URL}?estado=${estado}`);
    return response.data.data;
  },

  // Obtener detalles por movimiento
  obtenerPorMovimiento: async (movimientoId: number): Promise<Detalles[]> => {
    const response = await axios.get<DetallesListResponse>(`${API_URL}?movimientoId=${movimientoId}`);
    return response.data.data;
  },

  // Obtener historial de un material
  obtenerHistorialMaterial: async (materialId: number): Promise<Detalles[]> => {
    const response = await axios.get<DetallesListResponse>(`${API_URL}?materialId=${materialId}`);
    return response.data.data;
  }
};