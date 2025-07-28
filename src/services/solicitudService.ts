import axios from "@/lib/axios";
import { Solicitud } from '../types/solicitud.types';

const API_URL = '/solicitudes';

export interface SolicitudResponse {
  message: string;
  data: Solicitud | Solicitud[] | null;
}

export const solicitudService = {
  getAll: async (filters?: { aprobada?: boolean, personaSolicitaId?: number }): Promise<SolicitudResponse> => {
    let url = API_URL;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.aprobada !== undefined) {
        params.append('aprobada', filters.aprobada.toString());
      }
      if (filters.personaSolicitaId !== undefined) {
        params.append('personaSolicitaId', filters.personaSolicitaId.toString());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    const response = await axios.get<SolicitudResponse>(url);
    return response.data;
  },

  getById: async (id: number): Promise<SolicitudResponse> => {
    const response = await axios.get<SolicitudResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (solicitud: Partial<Solicitud>): Promise<SolicitudResponse> => {
    const response = await axios.post<SolicitudResponse>(API_URL, solicitud);
    return response.data;
  },

  update: async (id: number, solicitud: Partial<Solicitud>): Promise<SolicitudResponse> => {
    const response = await axios.patch<SolicitudResponse>(`${API_URL}/${id}`, solicitud);
    return response.data;
  },

  delete: async (id: number): Promise<SolicitudResponse> => {
    const response = await axios.delete<SolicitudResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  aprobar: async (id: number, aprobadorId: number): Promise<SolicitudResponse> => {
    const response = await axios.post<SolicitudResponse>(`${API_URL}/${id}/aprobar`, { aprobadorId });
    return response.data;
  },

  entregar: async (id: number, encargadoId: number): Promise<SolicitudResponse> => {
    const response = await axios.post<SolicitudResponse>(`${API_URL}/${id}/entregar`, { encargadoId });
    return response.data;
  },

  devolver: async (id: number, encargadoId: number): Promise<SolicitudResponse> => {
    const response = await axios.post<SolicitudResponse>(`${API_URL}/${id}/devolver`, { encargadoId });
    return response.data;
  },

  getMovimientos: async (id: number): Promise<SolicitudResponse> => {
    const response = await axios.get<SolicitudResponse>(`${API_URL}/${id}/movimientos`);
    return response.data;
  }
};