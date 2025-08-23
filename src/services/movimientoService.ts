import axios from "@/lib/axios";
import { Movimiento } from '../types/movimiento.types';
import { materialService } from './materialService'; // Importar para actualizar material

const API_URL = '/movimientos';

export interface MovimientosPaginados {
  data: Movimiento[];
  total: number;
  page: number;
  lastPage: number;
}

export const movimientoService = {
  crear: async (data: Partial<Movimiento>): Promise<Movimiento> => {
    // Asegúrate de que data incluya descripcion y sitios si es necesario
    const response = await axios.post<Movimiento>(API_URL, data);
    const nuevoMovimiento = response.data;

    // Actualizar sitio del material si hay sitios en el movimiento
    if (nuevoMovimiento.sitios && nuevoMovimiento.sitios.length > 0 && nuevoMovimiento.materialId) {
      const nuevoSitioId = nuevoMovimiento.sitios[0].id; // Asumir primer sitio como destino
      await materialService.update(nuevoMovimiento.materialId, { sitioId: nuevoSitioId });
    }

    return nuevoMovimiento;
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

  aprobar: async (id: number, aprobadorId: number): Promise<Movimiento> => {
    const response = await axios.post<Movimiento>(`${API_URL}/${id}/aprobar`, { aprobadorId });
    const movimientoAprobado = response.data;

    // Similar lógica para actualizar sitio al aprobar
    if (movimientoAprobado.sitios && movimientoAprobado.sitios.length > 0 && movimientoAprobado.materialId) {
      const nuevoSitioId = movimientoAprobado.sitios[0].id;
      await materialService.update(movimientoAprobado.materialId, { sitioId: nuevoSitioId });
    }

    return movimientoAprobado;
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