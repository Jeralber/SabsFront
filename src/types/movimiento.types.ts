// types/movimiento.types.ts
import { TipoMovimiento } from './tipo-movimiento.types';
import { Persona } from './persona.types';
import { Material } from './material.types';
import { Detalles } from './detalles.types';
import { Sitio } from './sitio.types';

export interface Movimiento {
  id: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  tipoMovimientoId: number;
  movimientoOrigenId?: number; // Para devoluciones
  materialId?: number; // Material principal si aplica
  materialPrestamoId?: number; // Para préstamos
  personaSolicitaId: number;
  personaApruebaId?: number;
  sitioOrigenId?: number;
  sitioDestinoId?: number;
  observaciones?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;

  // Relaciones
  tipoMovimiento?: TipoMovimiento;
  personaSolicita?: Persona;
  personaAprueba?: Persona;
  material?: Material;
  sitioOrigen?: Sitio;
  sitioDestino?: Sitio;
  detalles?: Detalles[];
  movimientoOrigen?: Movimiento;
  devoluciones?: Movimiento[];

  // Campos calculados opcionales
  saldoPendiente?: number;
  totalDevuelto?: number;
}

// DTOs para crear y aprobar movimientos
// types/movimiento.types.ts
export interface CreateMovimientoDto {
  personaSolicitaId: number;
  sitioOrigenId: number; // requerido según backend
  sitioDestinoId?: number | null;
  tipoMovimientoId?: number | null; // <-- NUEVO
  detalles: {
    materialId: number;
    cantidad: number;
  }[];
}

export interface AprobarMovimientoDto {
  aprobadoPorId: number;
}

export interface RechazarMovimientoDto {
  rechazadoPorId: number;
}

// DTO de backend para devolución (incluye movimientoOrigenId)
export interface DevolverMaterialDto {
  movimientoOrigenId: number;
  personaSolicitaId: number;
  detalles: { materialId: number; cantidad: number }[];
}

// DTO que usa el front al llamar PATCH /movimientos/:id/devolver
export interface DevolverMaterialRequest {
  personaSolicitaId: number;
  detalles: { materialId: number; cantidad: number }[];
}

// Respuestas de la API
export interface MovimientoResponse {
  message: string;
  data: Movimiento;
}

export interface MovimientoListResponse {
  message: string;
  data: Movimiento[];
}
