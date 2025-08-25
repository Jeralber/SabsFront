import { useState, useEffect, useCallback } from 'react';
import { Material } from '../types/material.types';
import { materialService,  } from '../services/materialService';
import { useGenericCRUD } from './useGenericCRUD';

// Adaptador para hacer compatible materialService con useGenericCRUD
const materialServiceAdapter = {
  getAll: async (): Promise<{ data: Material[] }> => {
    const response = await materialService.getAll();
    return {
      data: Array.isArray(response.data) ? response.data : []
    };
  },
  
  getById: async (id: number): Promise<{ data: Material }> => {
    const response = await materialService.getById(id);
    if (!response.data || Array.isArray(response.data)) {
      throw new Error('Material no encontrado');
    }
    return { data: response.data };
  },
  
  create: async (material: Partial<Material>): Promise<{ data: Material }> => {
    const response = await materialService.create(material);
    if (!response.data || Array.isArray(response.data)) {
      throw new Error('Error al crear material');
    }
    return { data: response.data };
  },
  
  update: async (id: number, material: Partial<Material>): Promise<{ data: Material }> => {
    const response = await materialService.update(id, material);
    if (!response.data || Array.isArray(response.data)) {
      throw new Error('Error al actualizar material');
    }
    return { data: response.data };
  },
  
  delete: async (id: number): Promise<void> => {
    await materialService.delete(id);
  }
};

export const useMaterial = () => {
  const crud = useGenericCRUD(materialServiceAdapter, 'material');
  
  // Estados adicionales específicos para materiales
  const [stockMateriales, setStockMateriales] = useState<Material[]>([]);
  
  // Función específica para obtener stock
  const fetchStock = useCallback(async () => {
    crud.setLoading(true);
    try {
      const stockData = await materialService.getStock();
      setStockMateriales(stockData);
    } catch (error) {
      crud.setError(error instanceof Error ? error.message : 'Error al cargar stock');
    } finally {
      crud.setLoading(false);
    }
  }, [crud]);
  
  // Función específica para obtener por sitio
  const fetchBySitio = useCallback(async (sitioId: number) => {
    crud.setLoading(true);
    try {
      const response = await materialService.getBySitio(sitioId);
      const materiales = Array.isArray(response.data) ? response.data : [];
      crud.setState(prev => ({ ...prev, items: materiales, loading: false }));
    } catch (error) {
      crud.setError(error instanceof Error ? error.message : 'Error al cargar materiales por sitio');
    }
  }, [crud]);
  
  // Inicializar datos
  useEffect(() => {
    crud.fetchAll();
  }, [crud.fetchAll]);
  
  return {
    // Estados del CRUD genérico
    materiales: crud.items,
    selectedMaterial: crud.selectedItem,
    loading: crud.loading,
    error: crud.error,
    
    // Estados específicos
    stockMateriales,
    
    // Funciones del CRUD genérico
    fetchMateriales: crud.fetchAll,
    fetchMaterialById: crud.fetchById,
    createMaterial: crud.create,
    updateMaterial: crud.update,
    deleteMaterial: crud.remove,
    clearError: crud.clearError,
    clearSelection: crud.clearSelection,
    
    // Funciones específicas
    fetchStock,
    fetchBySitio
  };
};