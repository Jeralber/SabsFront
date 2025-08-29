import { Material } from './material.types';
import { Persona } from './persona.types';
import { Movimiento } from './movimiento.types';
import { TipoMovimiento } from './tipo-movimiento.types';

export interface Detalles {
  id: number;
  movimientoId: number;
  materialId: number;
  tipoMovimientoId: number;
  cantidad: number;
  estado: 'INFORMATIVO' | 'PROCESADO';
  solicitanteId: number;
  aprobadorId?: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // Relaciones
  movimiento: Movimiento;
  material: Material;
  tipoMovimiento: TipoMovimiento;
  solicitante: Persona;
  aprobador?: Persona;
}

// Filtros para consultas
export interface DetallesFiltros {
  estado?: 'INFORMATIVO' | 'PROCESADO';
  materialId?: number;
  solicitanteId?: number;
  aprobadorId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Respuestas de la API
export interface DetallesResponse {
  message: string;
  data: Detalles;
}

export interface DetallesListResponse {
  message: string;
  data: Detalles[];
}

// Para estadísticas
export interface EstadisticasDetalles {
  totalMovimientos: number;
  movimientosPorTipo: Record<string, number>;
  movimientosPorEstado: Record<string, number>;
  materialesMasMovidos: Array<{
    materialId: number;
    materialNombre: string;
    totalMovimientos: number;
  }>;
}