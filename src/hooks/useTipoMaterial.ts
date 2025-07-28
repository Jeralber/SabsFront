import { useState, useEffect, useCallback } from 'react';
import { TipoMaterial } from '../types/tipo-material.types';
import { tipoMaterialService } from '../services/tipoMaterialService';

interface UseTipoMaterialState {
  tiposMaterial: TipoMaterial[];
  selectedTipoMaterial: TipoMaterial | null;
  loading: boolean;
  error: string | null;
}

export const useTipoMaterial = () => {
  const [state, setState] = useState<UseTipoMaterialState>({
    tiposMaterial: [],
    selectedTipoMaterial: null,
    loading: false,
    error: null
  });

  const fetchTiposMaterial = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoMaterialService.getAll();
      setState(prev => ({
        ...prev,
        tiposMaterial: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar tipos de material'
      }));
    }
  }, []);

  const fetchTipoMaterialById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoMaterialService.getById(id);
      setState(prev => ({
        ...prev,
        selectedTipoMaterial: response.data as TipoMaterial,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar tipo de material con ID ${id}`
      }));
    }
  }, []);

  const createTipoMaterial = useCallback(async (tipoMaterial: Partial<TipoMaterial>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoMaterialService.create(tipoMaterial);
      setState(prev => ({
        ...prev,
        tiposMaterial: [...prev.tiposMaterial, response.data as TipoMaterial],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear tipo de material';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateTipoMaterial = useCallback(async (id: number, tipoMaterial: Partial<TipoMaterial>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoMaterialService.update(id, tipoMaterial);
      const updatedTipoMaterial = response.data as TipoMaterial;
      setState(prev => ({
        ...prev,
        tiposMaterial: prev.tiposMaterial.map(t => t.id === id ? updatedTipoMaterial : t),
        selectedTipoMaterial: prev.selectedTipoMaterial?.id === id ? updatedTipoMaterial : prev.selectedTipoMaterial,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar tipo de material con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteTipoMaterial = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await tipoMaterialService.delete(id);
      setState(prev => ({
        ...prev,
        tiposMaterial: prev.tiposMaterial.filter(t => t.id !== id),
        selectedTipoMaterial: prev.selectedTipoMaterial?.id === id ? null : prev.selectedTipoMaterial,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar tipo de material con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchTiposMaterial();
  }, [fetchTiposMaterial]);

  return {
    ...state,
    fetchTiposMaterial,
    fetchTipoMaterialById,
    createTipoMaterial,
    updateTipoMaterial,
    deleteTipoMaterial
  };
};