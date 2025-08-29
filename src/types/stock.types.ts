import { Material } from './material.types';

export interface Stock {
  id: number;
  codigo?: string; // Código individual opcional por unidad
  cantidad: number;
  activo: boolean; // Inicia inactivo hasta ser activado
  requiereCodigo: boolean; // Indica si este stock requiere código individual
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  materialId: number;
  
  // Relación
  material?: Material;
}

// DTO para crear stock
export interface CreateStockDto {
  materialId: number;
  cantidad: number;
  requiereCodigo?: boolean;
  codigo?: string;
}

// DTO para actualizar stock
export interface UpdateStockDto {
  cantidad?: number;
  codigo?: string;
  activo?: boolean;
  requiereCodigo?: boolean;
}

// DTO para activar stock
export interface ActivateStockDto {
  codigo?: string;
}

// Respuesta de la API
export interface StockResponse {
  message: string;
  data: Stock;
}

export interface StockListResponse {
  message: string;
  data: Stock[];
}

// Para el formulario de gestión de stock
export interface StockFormData {
  cantidad: number;
  requiereCodigo: boolean;
  codigo?: string;
}

// Estado del stock para el componente
export interface StockState {
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  selectedStock: Stock | null;
}