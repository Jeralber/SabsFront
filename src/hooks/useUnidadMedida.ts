import { useState, useEffect, useCallback } from 'react';
import { UnidadMedida } from '../types/unidad-medida.types';
import { unidadMedidaService } from '../services/unidadMedidaService';

interface UseUnidadMedidaState {
  unidadesMedida: UnidadMedida[];
  selectedUnidadMedida: UnidadMedida | null;
  loading: boolean;
  error: string | null;
}

export const useUnidadMedida = () => {
  const [state, setState] = useState<UseUnidadMedidaState>({
    unidadesMedida: [],
    selectedUnidadMedida: null,
    loading: false,
    error: null
  });

  const fetchUnidadesMedida = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await unidadMedidaService.getAll();
      setState(prev => ({
        ...prev,
        unidadesMedida: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar unidades de medida'
      }));
    }
  }, []);

  const fetchUnidadMedidaById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await unidadMedidaService.getById(id);
      setState(prev => ({
        ...prev,
        selectedUnidadMedida: response.data as UnidadMedida,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar unidad de medida con ID ${id}`
      }));
    }
  }, []);

  const createUnidadMedida = useCallback(async (unidadMedida: Partial<UnidadMedida>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await unidadMedidaService.create(unidadMedida);
      setState(prev => ({
        ...prev,
        unidadesMedida: [...prev.unidadesMedida, response.data as UnidadMedida],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear unidad de medida';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateUnidadMedida = useCallback(async (id: number, unidadMedida: Partial<UnidadMedida>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await unidadMedidaService.update(id, unidadMedida);
      const updatedUnidadMedida = response.data as UnidadMedida;
      setState(prev => ({
        ...prev,
        unidadesMedida: prev.unidadesMedida.map(um => um.id === id ? updatedUnidadMedida : um),
        selectedUnidadMedida: prev.selectedUnidadMedida?.id === id ? updatedUnidadMedida : prev.selectedUnidadMedida,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar unidad de medida con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);


  const patchUnidadMedida = useCallback(async (id: number, unidadMedida: Partial<UnidadMedida>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await unidadMedidaService.patch(id, unidadMedida);
      const updatedUnidadMedida = response.data as UnidadMedida;
      setState(prev => ({
        ...prev,
        unidadesMedida: prev.unidadesMedida.map(um => um.id === id ? updatedUnidadMedida : um),
        selectedUnidadMedida: prev.selectedUnidadMedida?.id === id ? updatedUnidadMedida : prev.selectedUnidadMedida,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar unidad de medida con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);


    
  const deleteUnidadMedida = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await unidadMedidaService.delete(id);
      setState(prev => ({
        ...prev,
        unidadesMedida: prev.unidadesMedida.filter(um => um.id !== id),
        selectedUnidadMedida: prev.selectedUnidadMedida?.id === id ? null : prev.selectedUnidadMedida,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar unidad de medida con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchUnidadesMedida();
  }, [fetchUnidadesMedida]);

  return {
    ...state,
    fetchUnidadesMedida,
    fetchUnidadMedidaById,
    createUnidadMedida,
    updateUnidadMedida,
    deleteUnidadMedida,
    patchUnidadMedida
  };
};