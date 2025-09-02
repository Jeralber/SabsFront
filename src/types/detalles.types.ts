import { Material } from './material.types';
import { Persona } from './persona.types';
import { Movimiento } from './movimiento.types';

export interface Detalles {
  id: number;
  movimientoId: number;
  materialId: number;
  cantidad: number;
  estado: string; // Cambiado de enum a string para coincidir con backend
  personaSolicitaId: number | null; // Cambiado de solicitanteId
  personaApruebaId?: number; // Cambiado de aprobadorId
  fechaCreacion: Date;
  fechaActualizacion?: Date; // Ahora opcional para coincidir con backend
  
  // Relaciones
  movimiento: Movimiento;
  material: Material;
  personaSolicita?: Persona; // Cambiado de solicitante
  personaAprueba?: Persona; // Cambiado de aprobador
}

// Filtros para consultas - actualizados
export interface DetallesFiltros {
  estado?: string; // Cambiado para ser más flexible
  materialId?: number;
  personaSolicitaId?: number; // Cambiado de solicitanteId
  personaApruebaId?: number; // Cambiado de aprobadorId
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