import axios from "@/lib/axios";
import { Solicitud, } from '../types/solicitud.types';

const API_URL = '/solicitudes';

export interface SolicitudResponse {
  message?: string;
  data?: Solicitud | Solicitud[];
}

export interface MovimientoSolicitud {
  id: number;
  tipo: string;
  material: string;
  cantidad: number;
  persona: string;
  fecha: Date;
}

export interface ResumenSolicitud {
  solicitud: {
    id: number;
    descripcion: string;
    estado: string;
    fechaCreacion: Date;
    solicitante: any;
  };
  detalles: Array<{
    id: number;
    material: {
      id: number;
      nombre: string;
      codigo: string;
      unidadMedida: string;
    };
    cantidad: number;
    estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ENTREGADO' | 'DEVUELTO';
    personaAprueba?: {
      id: number;
      nombre: string;
      apellido: string;
    };
    movimiento?: {
      id: number;
      fechaCreacion: Date;
      tipoMovimiento: string;
    };
  }>;
  totales: {
    totalMateriales: number;
    materialesAprobados: number;
    materialesPendientes: number;
    materialesRechazados: number;
    materialesEntregados: number;
    materialesDevueltos: number;
  };
}

export interface HistorialDetalle {
  detalleId: number;
  cantidad: number;
  estado: string;
  fechaSolicitud: Date;
  fechaActualizacion: Date;
  materialNombre: string;
  materialDescripcion: string;
  solicitudDescripcion: string;
  solicitudEstado: string;
  personaSolicitanteId: number;
  personaIdentificacion: string;
  personaNombre: string;
  personaApellido: string;
  personaCorreo: string;
  personaTelefono: string;
  fichaId: number;
  fichaNumero: number;
  cantidadAprendices: number;
  tituladoId: number;
  tituladoNombre: string;
  areaId: number;
  areaNombre: string;
  centroId: number;
  centroNombre: string;
  sedeId: number;
  sedeNombre: string;
  sedeDireccion: string;
  municipioId: number;
  municipioNombre: string;
  personaApruebaId?: number;
  personaApruebaNombre?: string;
  personaApruebaApellido?: string;
}

export const solicitudService = {
  crear: async (data: Partial<Solicitud>): Promise<Solicitud> => {
    const response = await axios.post<Solicitud>(API_URL, data);
    return response.data;
  },

  obtenerTodas: async (filters?: { personaSolicitaId?: number }): Promise<Solicitud[]> => {
    let url = API_URL;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.personaSolicitaId !== undefined) {
        params.append('personaSolicitaId', filters.personaSolicitaId.toString());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    const response = await axios.get<Solicitud[]>(url);
    return response.data;
  },

  obtenerPorId: async (id: number): Promise<Solicitud> => {
    const response = await axios.get<Solicitud>(`${API_URL}/${id}`);
    return response.data;
  },

  actualizar: async (id: number, data: Partial<Solicitud>): Promise<Solicitud> => {
    const response = await axios.patch<Solicitud>(`${API_URL}/${id}`, data);
    return response.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  obtenerMovimientos: async (id: number): Promise<MovimientoSolicitud[]> => {
    const response = await axios.get<MovimientoSolicitud[]>(`${API_URL}/${id}/movimientos`);
    return response.data;
  },

  obtenerResumen: async (id: number): Promise<ResumenSolicitud> => {
    const response = await axios.get<ResumenSolicitud>(`${API_URL}/${id}/resumen`);
    return response.data;
  },

  obtenerDetallesCompletos: async (id: number): Promise<Solicitud> => {
    const response = await axios.get<Solicitud>(`${API_URL}/${id}/detalles`);
    return response.data;
  },

  obtenerHistorialCompleto: async (): Promise<HistorialDetalle[]> => {
    const response = await axios.get<HistorialDetalle[]>('/detalles/historial');
    return response.data;
  },

  obtenerHistorialPorPersona: async (personaId: number): Promise<HistorialDetalle[]> => {
    const response = await axios.get<HistorialDetalle[]>(`/detalles/historial/persona/${personaId}`);
    return response.data;
  },
  aprobar: async (id: number, aprobadorId: number): Promise<any> => {
    const response = await axios.post(`${API_URL}/${id}/aprobar`, { aprobadorId });
    return response.data;
  },

  entregar: async (id: number, encargadoId: number): Promise<any> => {
    const response = await axios.post(`${API_URL}/${id}/entregar`, { encargadoId });
    return response.data;
  },

  devolver: async (id: number, encargadoId: number): Promise<any> => {
    const response = await axios.post(`${API_URL}/${id}/devolver`, { encargadoId });
    return response.data;
  },

  rechazar: async (id: number, aprobadorId: number): Promise<any> => {
    const response = await axios.post(`${API_URL}/${id}/rechazar`, { aprobadorId });
    return response.data;
  },


};