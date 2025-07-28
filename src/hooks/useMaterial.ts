import { useState, useEffect, useCallback } from 'react';
import { Material } from '../types/material.types';
import { materialService } from '../services/materialService';

interface UseMaterialState {
  materiales: Material[];
  stockMateriales: Material[];
  selectedMaterial: Material | null;
  loading: boolean;
  error: string | null;
}

export const useMaterial = () => {
  const [state, setState] = useState<UseMaterialState>({
    materiales: [],
    stockMateriales: [],
    selectedMaterial: null,
    loading: false,
    error: null
  });

  const fetchMateriales = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await materialService.getAll();
      setState(prev => ({
        ...prev,
        materiales: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar materiales'
      }));
    }
  }, []);

  const fetchStock = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const stockData = await materialService.getStock();
      setState(prev => ({
        ...prev,
        stockMateriales: stockData,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar stock de materiales'
      }));
    }
  }, []);

  const fetchMaterialById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await materialService.getById(id);
      setState(prev => ({
        ...prev,
        selectedMaterial: response.data as Material,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar material con ID ${id}`
      }));
    }
  }, []);

  const createMaterial = useCallback(async (material: Partial<Material>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await materialService.create(material);
      setState(prev => ({
        ...prev,
        materiales: [...prev.materiales, response.data as Material],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear material';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateMaterial = useCallback(async (id: number, material: Partial<Material>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await materialService.update(id, material);
      const updatedMaterial = response.data as Material;
      setState(prev => ({
        ...prev,
        materiales: prev.materiales.map(m => m.id === id ? updatedMaterial : m),
        selectedMaterial: prev.selectedMaterial?.id === id ? updatedMaterial : prev.selectedMaterial,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar material con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteMaterial = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await materialService.delete(id);
      setState(prev => ({
        ...prev,
        materiales: prev.materiales.filter(m => m.id !== id),
        selectedMaterial: prev.selectedMaterial?.id === id ? null : prev.selectedMaterial,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar material con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchMateriales();
  }, [fetchMateriales]);

  return {
    ...state,
    fetchMateriales,
    fetchStock,
    fetchMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial
  };
};