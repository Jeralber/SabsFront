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
    const response = await axios.post<{message: string, data: Movimiento}>(API_URL, data);
    const nuevoMovimiento = response.data.data; // Extraer del objeto envuelto

    // Actualizar sitio del material si hay sitio en el movimiento
    if (nuevoMovimiento.sitio && nuevoMovimiento.materialId) {
      const nuevoSitioId = nuevoMovimiento.sitio.id;
      await materialService.update(nuevoMovimiento.materialId, { sitioId: nuevoSitioId });
    }

    return nuevoMovimiento;
  },

  obtenerTodos: async (): Promise<Movimiento[]> => {
    const response = await axios.get<{message: string, data: Movimiento[]}>(API_URL);
    return response.data.data;
  },

  obtenerPorId: async (id: number): Promise<Movimiento> => {
    const response = await axios.get<{message: string, data: Movimiento}>(`${API_URL}/${id}`);
    return response.data.data;
  },

  actualizar: async (id: number, data: Partial<Movimiento>): Promise<Movimiento> => {
    const response = await axios.patch<{message: string, data: Movimiento}>(`${API_URL}/${id}`, data);
    return response.data.data;
  },

  eliminar: async (id: number): Promise<{ message: string }> => {
    const response = await axios.delete<{ message: string }>(`${API_URL}/${id}`);
    return response.data;
  },

  aprobar: async (id: number, aprobadorId: number): Promise<Movimiento> => {
    const response = await axios.post<{message: string, data: Movimiento}>(`${API_URL}/${id}/aprobar`, { aprobadorId });
    const movimientoAprobado = response.data.data;

    // Similar lógica para actualizar sitio al aprobar
    if (movimientoAprobado.sitio && movimientoAprobado.materialId) {
      const nuevoSitioId = movimientoAprobado.sitio.id;
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
    const response = await axios.post<{message: string, data: Movimiento}>(`${API_URL}/desde-solicitud`, params);
    return response.data.data;
  },
  
  crearConSolicitud: async (data: Partial<Movimiento> & { solicitudId?: number }): Promise<{
    message: string;
    data: Movimiento;
  }> => {
    const response = await axios.post(`${API_URL}`, data);
    return response.data;
  }
};