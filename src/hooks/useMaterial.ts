import { useState, useEffect, useCallback } from "react";
import { Material } from "../types/material.types";
import { materialService } from "../services/materialService";
import { useGenericCRUD } from "./useGenericCRUD";

// Adaptador para hacer compatible materialService con useGenericCRUD
const materialServiceAdapter = {
  getAll: async (): Promise<{ data: Material[] }> => {
    const response = await materialService.getAll();
    return {
      data: Array.isArray(response.data) ? response.data : [],
    };
  },

  getById: async (id: number): Promise<{ data: Material }> => {
    const response = await materialService.getById(id);
    if (!response.data || Array.isArray(response.data)) {
      throw new Error("Material no encontrado");
    }
    return { data: response.data };
  },

  create: async (material: Partial<Material>): Promise<{ data: Material }> => {
    const response = await materialService.create(material);
    if (!response.data || Array.isArray(response.data)) {
      throw new Error("Error al crear material");
    }
    return { data: response.data };
  },

  update: async (
    id: number,
    material: Partial<Material>
  ): Promise<{ data: Material }> => {
    const response = await materialService.update(id, material);
    if (!response.data || Array.isArray(response.data)) {
      throw new Error("Error al actualizar material");
    }
    return { data: response.data };
  },

  delete: async (id: number): Promise<void> => {
    await materialService.delete(id);
  },
};

export const useMaterial = () => {
  const crud = useGenericCRUD(materialServiceAdapter, "material");
  const [stockMateriales, setStockMateriales] = useState<Material[]>([]);
  const fetchStock = useCallback(async () => {
    crud.setLoading(true);
    try {
      const stockData = await materialService.getStock();
      setStockMateriales(stockData);
    } catch (error) {
      crud.setError(
        error instanceof Error ? error.message : "Error al cargar stock"
      );
    } finally {
      crud.setLoading(false);
    }
    
  }, [crud]);
  const fetchMaterialesPrestadosPendientes = useCallback(async () => {
    crud.setLoading(true);
    try {
      const response = await materialService.getMaterialesPrestadosPendientes();
      const materiales = Array.isArray(response.data) ? response.data : [];
      crud.setState((prev) => ({ ...prev, items: materiales, loading: false }));
    } catch (error) {
      crud.setError(
        error instanceof Error
          ? error.message
          : "Error al cargar materiales prestados pendientes"
      );
    }
  }, [crud]);

  const fetchBySitio = useCallback(
    async (sitioId: number) => {
      crud.setLoading(true);
      try {
        const response = await materialService.getBySitio(sitioId);
        const materiales = Array.isArray(response.data) ? response.data : [];
        crud.setState((prev) => ({
          ...prev,
          items: materiales,
          loading: false,
        }));
      } catch (error) {
        crud.setError(
          error instanceof Error
            ? error.message
            : "Error al cargar materiales por sitio"
        );
      }
    },
    [crud]
  );

  const fetchMyMaterials = useCallback(async () => {
    crud.setLoading(true);
    try {
      const response = await materialService.getMyMaterials();
      const materiales = Array.isArray(response.data) ? response.data : [];
      crud.setState((prev) => ({ ...prev, items: materiales, loading: false }));
    } catch (error) {
      crud.setError(
        error instanceof Error
          ? error.message
          : "Error al cargar mis materiales"
      );
    }
  }, []);
  const fetchMyStock = useCallback(async () => {
    crud.setLoading(true);
    try {
      const response = await materialService.getMyStock();
      const stock = Array.isArray(response) ? response : [];
      setStockMateriales(stock);
      crud.setLoading(false);
    } catch (error) {
      crud.setError(
        error instanceof Error ? error.message : "Error al cargar mi stock"
      );
    }
  }, []);

  useEffect(() => {
    fetchMyMaterials();
  }, []);

  return {
    materiales: crud.items,
    selectedMaterial: crud.selectedItem,
    loading: crud.loading,
    error: crud.error,
    stockMateriales,

    fetchMateriales: crud.fetchAll,
    fetchMaterialById: crud.fetchById,
    createMaterial: crud.create,
    updateMaterial: crud.update,
    deleteMaterial: crud.remove,
    clearError: crud.clearError,
    clearSelection: crud.clearSelection,
    fetchStock,
    fetchBySitio,
    fetchMyMaterials,
    fetchMyStock,
    fetchMaterialesPrestadosPendientes,  // ✅ Nombre corregido
    
    // ✅ NUEVOS: Métodos de sincronización mejorada
    refreshAfterDevolucion: useCallback(async () => {
      crud.setLoading(true);
      try {
        const response = await materialService.refreshAfterCriticalOperation('devolucion');
        const materiales = Array.isArray(response.data) ? response.data : [];
        crud.setState((prev) => ({ ...prev, items: materiales, loading: false }));
        
        // También actualizar stock si es necesario
        await fetchMyStock();
      } catch (error) {
        console.warn('Error en refreshAfterDevolucion:', error);
        // Fallback a fetchMateriales normal
        await crud.fetchAll();
      }
    }, [crud, fetchMyStock]),
    
    refreshAfterPrestamo: useCallback(async () => {
      crud.setLoading(true);
      try {
        const response = await materialService.refreshAfterCriticalOperation('prestamo');
        const materiales = Array.isArray(response.data) ? response.data : [];
        crud.setState((prev) => ({ ...prev, items: materiales, loading: false }));
        
        // También actualizar stock
        await fetchMyStock();
      } catch (error) {
        console.warn('Error en refreshAfterPrestamo:', error);
        // Fallback a fetchMateriales normal
        await crud.fetchAll();
      }
    }, [crud, fetchMyStock]),
    
    // ✅ NUEVO: Método de sincronización inteligente
    smartSync: useCallback(async (operationType: 'devolucion' | 'prestamo' | 'general' = 'general') => {
      try {
        const response = await materialService.refreshAfterCriticalOperation(operationType);
        const materiales = Array.isArray(response.data) ? response.data : [];
        crud.setState((prev) => ({ ...prev, items: materiales }));
        
        // Actualizar stock en paralelo para operaciones críticas
        if (operationType === 'devolucion' || operationType === 'prestamo') {
          fetchMyStock().catch(err => console.warn('Error actualizando stock:', err));
        }
        
        return response;
      } catch (error) {
        console.warn(`Error en smartSync (${operationType}):`, error);
        // Fallback silencioso
        return crud.fetchAll();
      }
    }, [crud, fetchMyStock])
  };
};
