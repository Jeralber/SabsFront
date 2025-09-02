import { Material } from './material.types';
import { Sitio } from './sitio.types'; // Asumiendo que existe este tipo

// Interfaces para las relaciones
export interface StockMovimiento {
  id: number;
  // Propiedades del movimiento de stock
}

export interface Stock {
  id: number;
  codigo?: string; // Código individual opcional por unidad
  cantidad: number; // Valor por defecto 1 en backend
  activo: boolean; // Valor por defecto false en backend
  requiereCodigo: boolean; // Valor por defecto false en backend
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  materialId: number;
  
  // Nuevas propiedades del backend
  sitioId?: number;
  stockOrigenId?: number;
  esTransferido: boolean; // Valor por defecto false en backend
  
  // Relaciones
  material?: Material;
  sitio?: Sitio;
  stockOrigen?: Stock;
  movimientos?: StockMovimiento[];
  movimientosDestino?: StockMovimiento[];
}

// DTO para crear stock - actualizado
export interface CreateStockDto {
  materialId: number;
  cantidad: number;
  requiereCodigo?: boolean;
  codigo?: string;
  sitioId?: number; // Nueva propiedad
}

// DTO para actualizar stock - actualizado
export interface UpdateStockDto {
  cantidad?: number;
  codigo?: string;
  activo?: boolean;
  requiereCodigo?: boolean;
  sitioId?: number; // Nueva propiedad
  esTransferido?: boolean; // Nueva propiedad
}

// DTO para activar stock
export interface ActivateStockDto {
  codigo?: string;
}

// DTO para transferir stock
export interface TransferStockDto {
  stockDestinoId: number;
  cantidad: number;
  sitioDestinoId?: number;
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

// Para el formulario de gestión de stock - actualizado
export interface StockFormData {
  cantidad: number;
  requiereCodigo: boolean;
  codigo?: string;
  sitioId?: number; // Nueva propiedad
}

// Estado del stock para el componente
export interface StockState {
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  selectedStock: Stock | null;
}

// Filtros para consultas de stock
export interface StockFiltros {
  materialId?: number;
  sitioId?: number;
  activo?: boolean;
  requiereCodigo?: boolean;
  esTransferido?: boolean;
  codigo?: string;
}

// Para el historial de movimientos
export interface StockHistorial {
  movimientos: StockMovimiento[];
  movimientosDestino: StockMovimiento[];
}