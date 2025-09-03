import axios from "@/lib/axios";
import { Material } from "../types/material.types";

const API_URL = "/materiales";

export interface MaterialResponse {
  message: string;
  data: Material | Material[] | null;
}

export const materialService = {
  getAll: async (): Promise<MaterialResponse> => {
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
    // Soft delete: el backend no expone DELETE, desactivamos el material
    const response = await axios.patch<MaterialResponse>(`${API_URL}/${id}`, { activo: false });
    return response.data;
  },
  
  // ✅ NUEVOS MÉTODOS basados en el backend
  getMovimientos: async (id: number): Promise<MaterialResponse> => {
    const timestamp = Date.now() + Math.random();
    const response = await axios.get<MaterialResponse>(
      `${API_URL}/${id}/movimientos?_t=${timestamp}`
    );
    return response.data;
  },

  getSaldo: async (id: number): Promise<{ message: string; data: number }> => {
    const timestamp = Date.now() + Math.random();
    const response = await axios.get<{ message: string; data: number }>(
      `${API_URL}/${id}/saldo?_t=${timestamp}`
    );
    return response.data;
  },
  
  // ⬇️ Actualizado: usar /materiales (no existe /mis-materiales en este backend)
  getMyMaterials: async (): Promise<MaterialResponse> => {
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
  
  // ⬇️ Actualizado: devolver lista desde /materiales
  getMyStock: async (): Promise<Material[]> => {
    const timestamp = Date.now() + Math.random();
    const response = await axios.get<MaterialResponse>(
      `${API_URL}?_t=${timestamp}`
    );
    const data = response.data?.data;
    return Array.isArray(data) ? data : [];
  },

  // ⬇️ Actualizado: obtener todos y filtrar prestados pendientes en cliente
  getMaterialesPrestadosPendientes: async (): Promise<MaterialResponse> => {
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
    const all = Array.isArray(response.data?.data) ? (response.data!.data as Material[]) : [];
    const filtrados = all.filter((m: any) => m && m.esOriginal === false && Number(m.cantidadPrestada) > 0);
    return { message: "success", data: filtrados };
  },

  pollAfterDevolucion: async (maxAttempts: number = 5, baseDelay: number = 300): Promise<MaterialResponse> => {
    let lastResponse: MaterialResponse | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
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
            timeout: 5000
          }
        );
        
        lastResponse = response.data;
        
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(1.5, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        console.warn(`Intento de polling ${attempt} falló:`, error);
        
        if (attempt === maxAttempts && !lastResponse) {
          throw new Error(`Polling falló después de ${maxAttempts} intentos`);
        }
        
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    return lastResponse || { message: 'Polling completado sin respuesta válida', data: null };
  },

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
