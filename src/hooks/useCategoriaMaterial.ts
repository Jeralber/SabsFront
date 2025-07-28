import { useState, useEffect, useCallback } from 'react';
import { CategoriaMaterial } from '../types/categoria-material.types';
import { categoriaMaterialService } from '../services/categoriaMaterialService';

interface UseCategoriaMaterialState {
  categoriasMaterial: CategoriaMaterial[];
  selectedCategoriaMaterial: CategoriaMaterial | null;
  loading: boolean;
  error: string | null;
}

export const useCategoriaMaterial = () => {
  const [state, setState] = useState<UseCategoriaMaterialState>({
    categoriasMaterial: [],
    selectedCategoriaMaterial: null,
    loading: false,
    error: null
  });

  const fetchCategoriasMaterial = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoriaMaterialService.getAll();
      setState(prev => ({
        ...prev,
        categoriasMaterial: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar categorías de material'
      }));
    }
  }, []);

  const fetchCategoriaMaterialById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoriaMaterialService.getById(id);
      setState(prev => ({
        ...prev,
        selectedCategoriaMaterial: response.data as CategoriaMaterial,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar categoría de material con ID ${id}`
      }));
    }
  }, []);

  const createCategoriaMaterial = useCallback(async (categoriaMaterial: Partial<CategoriaMaterial>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoriaMaterialService.create(categoriaMaterial);
      setState(prev => ({
        ...prev,
        categoriasMaterial: [...prev.categoriasMaterial, response.data as CategoriaMaterial],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear categoría de material';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateCategoriaMaterial = useCallback(async (id: number, categoriaMaterial: Partial<CategoriaMaterial>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await categoriaMaterialService.update(id, categoriaMaterial);
      const updatedCategoriaMaterial = response.data as CategoriaMaterial;
      setState(prev => ({
        ...prev,
        categoriasMaterial: prev.categoriasMaterial.map(cm => cm.id === id ? updatedCategoriaMaterial : cm),
        selectedCategoriaMaterial: prev.selectedCategoriaMaterial?.id === id ? updatedCategoriaMaterial : prev.selectedCategoriaMaterial,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar categoría de material con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteCategoriaMaterial = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await categoriaMaterialService.delete(id);
      setState(prev => ({
        ...prev,
        categoriasMaterial: prev.categoriasMaterial.filter(cm => cm.id !== id),
        selectedCategoriaMaterial: prev.selectedCategoriaMaterial?.id === id ? null : prev.selectedCategoriaMaterial,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar categoría de material con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchCategoriasMaterial();
  }, [fetchCategoriasMaterial]);

  return {
    ...state,
    fetchCategoriasMaterial,
    fetchCategoriaMaterialById,
    createCategoriaMaterial,
    updateCategoriaMaterial,
    deleteCategoriaMaterial
  };
};