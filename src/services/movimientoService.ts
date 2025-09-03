// services/movimiento.service.ts
import axios from '@/lib/axios';
import { Movimiento } from '../types/movimiento.types';

const API_URL = '/movimientos';

export const MovimientoService = {
  // ✅ CRUD Básico
  async getAll(): Promise<Movimiento[]> {
    const res = await axios.get<Movimiento[]>(API_URL);
    return res.data;
  },

  async getById(id: number): Promise<Movimiento> {
    const res = await axios.get<Movimiento>(`${API_URL}/${id}`);
    return res.data;
  },

  // ✅ Crear movimiento
  async create(dto: {
    personaSolicitaId: number;
    sitioOrigenId: number;
    sitioDestinoId?: number | null;
    tipoMovimientoId?: number | null; // <-- NUEVO
    detalles: { materialId: number; cantidad: number }[];
  }): Promise<Movimiento> {
    const res = await axios.post<Movimiento>(API_URL, dto);
    return res.data;
  },

  // ✅ Aprobar movimiento
  async aprobar(id: number, aprobadoPorId: number): Promise<Movimiento> {
    const res = await axios.patch<Movimiento>(`${API_URL}/${id}/aprobar`, {
      aprobadoPorId
    });
    return res.data;
  },

  // ✅ Rechazar movimiento
  async rechazar(id: number, rechazadoPorId: number): Promise<Movimiento> {
    const res = await axios.patch<Movimiento>(`${API_URL}/${id}/rechazar`, {
      rechazadoPorId
    });
    return res.data;
  },

  // ✅ Devolver material
  async devolverMaterial(movimientoOrigenId: number, dto: {
    personaSolicitaId: number;
    detalles: { materialId: number; cantidad: number }[];
  }): Promise<Movimiento> {
    const res = await axios.patch<Movimiento>(`${API_URL}/${movimientoOrigenId}/devolver`, dto);
    return res.data;
  },


  async getSaldoPendiente(materialId: number): Promise<{ saldoPendiente: number }> {
    const res = await axios.get<{ saldoPendiente: number }>(`${API_URL}/saldo/${materialId}`);
    return res.data;
  },

  // ✅ Obtener préstamos activos por material
  async getPrestamosActivos(materialId: number): Promise<any[]> {
    const res = await axios.get<any[]>(`${API_URL}/prestamos-activos/${materialId}`);
    return res.data;
  },

  // ✅ REMOVIDO: Endpoints que no existen en el backend
  // - getPorMaterial (no existe en el controlador)
  // - getPendientes (se puede hacer con filtros en getAll)
};

export const movimientoService = MovimientoService;
