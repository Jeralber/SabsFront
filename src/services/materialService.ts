import axios from "@/lib/axios";
import { Material } from "../types/material.types";

const API_URL = "/materiales";

export interface MaterialResponse {
  message: string;
  data: Material | Material[] | null;
}

export const materialService = {
  getAll: async (): Promise<MaterialResponse> => {
    // ✅ MEJORADO: Timestamp más agresivo y headers para evitar cache
    const timestamp = Date.now() + Math.random();
    const response = await axios.get<MaterialResponse>(
      `${API_URL}?_t=${timestamp}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    return response.data;
  },

  getById: async (id: number): Promise<MaterialResponse> => {
    const timestamp = new Date().getTime();
    const response = await axios.get<MaterialResponse>(
      `${API_URL}/${id}?_t=${timestamp}`
    );
    return response.data;
  },

  getBySitio: async (sitioId: number): Promise<MaterialResponse> => {
    const timestamp = new Date().getTime();
    const response = await axios.get<MaterialResponse>(
      `${API_URL}?sitioId=${sitioId}&_t=${timestamp}`
    );
    return response.data;
  },

  getStock: async (): Promise<Material[]> => {
    const timestamp = new Date().getTime();
    const response = await axios.get<Material[]>(
      `${API_URL}/stock?_t=${timestamp}`
    );
    return response.data;
  },

  create: async (material: Partial<Material>): Promise<MaterialResponse> => {
    const response = await axios.post<MaterialResponse>(API_URL, material);
    return response.data;
  },

  update: async (
    id: number,
    material: Partial<Material>
  ): Promise<MaterialResponse> => {
    const response = await axios.patch<MaterialResponse>(
      `${API_URL}/${id}`,
      material
    );
    return response.data;
  },

  delete: async (id: number): Promise<MaterialResponse> => {
    const response = await axios.delete<MaterialResponse>(`${API_URL}/${id}`);
    return response.data;
  },
  
  // ✅ NUEVO: Obtener materiales del usuario para movimientos
  getMyMaterials: async (): Promise<MaterialResponse> => {
    const timestamp = Date.now() + Math.random();
    const response = await axios.get<MaterialResponse>(
      `/materiales/mis-materiales?_t=${timestamp}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    return response.data;
  },
  
  // ✅ NUEVO: Obtener stock de materiales del usuario
  getMyStock: async (): Promise<Material[]> => {
    const timestamp = Date.now() + Math.random();
    const response = await axios.get<Material[]>(
      `/materiales/mis-materiales/stock?_t=${timestamp}`
    );
    return response.data;
  },

  // ✅ AGREGAR: Método faltante para materiales prestados pendientes
  getMaterialesPrestadosPendientes: async (): Promise<MaterialResponse> => {
    const timestamp = Date.now() + Math.random();
    const response = await axios.get<MaterialResponse>(
      `/materiales/mis-materiales/prestados-pendientes?_t=${timestamp}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    return response.data;
  },

  // ✅ NUEVO: Polling inteligente para sincronización después de devoluciones
  pollAfterDevolucion: async (maxAttempts: number = 5, baseDelay: number = 300): Promise<MaterialResponse> => {
    let lastResponse: MaterialResponse | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Usar timestamp único para evitar cache
        const timestamp = Date.now() + Math.random() + attempt;
        const response = await axios.get<MaterialResponse>(
          `${API_URL}?_t=${timestamp}&poll=true`,
          {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              'X-Polling-Attempt': attempt.toString()
            },
            timeout: 5000 // Timeout de 5 segundos por intento
          }
        );
        
        lastResponse = response.data;
        
        // Si no es el último intento, esperar antes del siguiente
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(1.5, attempt - 1); // Backoff exponencial suave
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        console.warn(`Intento de polling ${attempt} falló:`, error);
        
        // Si es el último intento y no tenemos respuesta, lanzar error
        if (attempt === maxAttempts && !lastResponse) {
          throw new Error(`Polling falló después de ${maxAttempts} intentos`);
        }
        
        // Para otros intentos, continuar con el siguiente
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Backoff más agresivo en errores
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    return lastResponse || { message: 'Polling completado sin respuesta válida', data: null };
  },

  // ✅ NUEVO: Método específico para refrescar después de operaciones críticas
  refreshAfterCriticalOperation: async (operationType: 'devolucion' | 'prestamo' | 'general' = 'general'): Promise<MaterialResponse> => {
    const config = {
      devolucion: { attempts: 5, baseDelay: 200 },
      prestamo: { attempts: 3, baseDelay: 300 },
      general: { attempts: 2, baseDelay: 500 }
    };
    
    const { attempts, baseDelay } = config[operationType];
    return materialService.pollAfterDevolucion(attempts, baseDelay);
  },
};
