import { TipoMovimiento } from './tipo-movimiento.types';
import { Persona } from './persona.types';
import { Material } from './material.types';
import { Detalles } from './detalles.types';
import { Sitio } from './sitio.types';

export interface Movimiento {
  id: number;
  cantidad: number;
  materialId: number;
  tipoMovimientoId: number;
  solicitanteId: number; // Persona que solicita
  aprobadorId?: number; // Persona que aprueba (opcional hasta aprobación)
  sitioOrigenId?: number; // Para préstamos y devoluciones
  sitioDestinoId?: number; // Para entradas, salidas, préstamos
  estado: 'NO_APROBADO' | 'APROBADO' | 'RECHAZADO';
  observaciones?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // Relaciones
  material: Material;
  tipoMovimiento: TipoMovimiento;
  solicitante: Persona;
  aprobador?: Persona;
  sitioOrigen?: Sitio;
  sitioDestino?: Sitio;
  detalles?: Detalles[];
}

// DTOs para crear y aprobar movimientos
export interface CreateMovimientoDto {
  materialId: number;
  tipoMovimientoId: number;
  cantidad: number;
  sitioDestinoId: number; 
  solicitanteId: number;
  aprobadorId?: number; // Hacer opcional
  sitioOrigenId?: number;
  descripcion?: string; 
}

export interface AprobarMovimientoDto {
  estado: 'APROBADO' | 'RECHAZADO';
  aprobadorId: number;
  observaciones?: string;
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