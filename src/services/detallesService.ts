import axios from "@/lib/axios";
import { Detalles } from '../types/detalles.types';

const API_URL = '/detalles';

export interface DetallesResponse {
  message: string;
  data: Detalles | Detalles[];
}

export interface CreateDetallesDto {
  cantidad: number;
  materialId: number;
  solicitudId: number;
}

export const detallesService = {
  crear: async (data: CreateDetallesDto): Promise<DetallesResponse> => {
    const response = await axios.post<DetallesResponse>(API_URL, data);
    return response.data;
  },

  obtenerTodos: async (): Promise<DetallesResponse> => {
    const response = await axios.get<DetallesResponse>(API_URL);
    return response.data;
  },

  obtenerPorId: async (id: number): Promise<DetallesResponse> => {
    const response = await axios.get<DetallesResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  actualizar: async (id: number, data: Partial<CreateDetallesDto>): Promise<DetallesResponse> => {
    const response = await axios.patch<DetallesResponse>(`${API_URL}/${id}`, data);
    return response.data;
  },

  aprobar: async (id: number, personaApruebaId: number, options?: { noCrearSolicitud?: boolean }) => {
    const response = await axios.patch<DetallesResponse>(`${API_URL}/${id}/aprobar`, { personaApruebaId, ...options });
    return response.data;
  },

  rechazar: async (id: number, personaApruebaId: number): Promise<DetallesResponse> => {
    const response = await axios.patch<DetallesResponse>(`${API_URL}/${id}/rechazar`, { personaApruebaId });
    return response.data;
  },

  obtenerHistorialCompleto: async (): Promise<DetallesResponse> => {
    const response = await axios.get<DetallesResponse>(`${API_URL}/historial`);
    return response.data;
  },

  obtenerHistorialPorPersona: async (personaId: number): Promise<DetallesResponse> => {
    const response = await axios.get<DetallesResponse>(`${API_URL}/historial/persona/${personaId}`);
    return response.data;
  },
  eliminar: async (id: number): Promise<DetallesResponse> => {
    const response = await axios.delete<DetallesResponse>(`${API_URL}/${id}`);
    return response.data;
  },
  entregar: async (id: number, personaId: number): Promise<DetallesResponse> => {
    const response = await axios.patch<DetallesResponse>(`${API_URL}/${id}/entregar`, { personaId });
    return response.data;
  },
  devolver: async (id: number, personaId: number): Promise<DetallesResponse> => {
    const response = await axios.patch<DetallesResponse>(`${API_URL}/${id}/devolver`, { personaId });
    return response.data;
  }
};