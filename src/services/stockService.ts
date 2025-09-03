import axios from "@/lib/axios";
import { 
  CreateStockDto, 
  UpdateStockDto, 
  ActivateStockDto,
  StockResponse,
  StockListResponse 
} from '../types/stock.types';

const API_URL = '/stock';

export const stockService = {
  // Obtener todos los stocks
  getAll: async (): Promise<StockListResponse> => {
    const response = await axios.get<StockListResponse>(API_URL);
    return response.data;
  },

  // Obtener stock por ID
  getById: async (id: number): Promise<StockResponse> => {
    const response = await axios.get<StockResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener stocks por material
  getByMaterial: async (materialId: number): Promise<StockListResponse> => {
    const response = await axios.get<StockListResponse>(`${API_URL}/material/${materialId}`);
    return response.data;
  },

  // Obtener stocks activos por material
  getActiveByMaterial: async (materialId: number): Promise<StockListResponse> => {
    const response = await axios.get<StockListResponse>(`${API_URL}/material/${materialId}/active`);
    return response.data;
  },

  // Obtener total de stock activo por material
  getTotalActiveStock: async (materialId: number): Promise<{ total: number }> => {
    const response = await axios.get<{ total: number }>(`${API_URL}/material/${materialId}/total`);
    return response.data;
  },

  // Crear nuevo stock
  create: async (stockData: CreateStockDto): Promise<StockResponse> => {
    const response = await axios.post<StockResponse>(API_URL, stockData);
    return response.data;
  },

  // Actualizar stock
  update: async (id: number, stockData: UpdateStockDto): Promise<StockResponse> => {
    const response = await axios.patch<StockResponse>(`${API_URL}/${id}`, stockData);
    return response.data;
  },

  // Activar stock
  activate: async (id: number, activateData: ActivateStockDto): Promise<StockResponse> => {
    const response = await axios.patch<StockResponse>(`${API_URL}/${id}/activar`, activateData);
    return response.data;
  },

  // Desactivar stock
  deactivate: async (id: number): Promise<StockResponse> => {
    const response = await axios.patch<StockResponse>(`${API_URL}/${id}/desactivar`);
    return response.data;
  },

  // Eliminar stock
  delete: async (id: number): Promise<StockResponse> => {
    const response = await axios.delete<StockResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener stocks con filtros
  getWithFilters: async (filters: {
    materialId?: number;
    activo?: boolean;
    requiereCodigo?: boolean;
    sitioId?: number;
  }): Promise<StockListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.materialId) params.append('materialId', filters.materialId.toString());
    if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters.requiereCodigo !== undefined) params.append('requiereCodigo', filters.requiereCodigo.toString());
    if (filters.sitioId) params.append('sitioId', filters.sitioId.toString());
    
    const response = await axios.get<StockListResponse>(`${API_URL}?${params.toString()}`);
    return response.data;
  }
};