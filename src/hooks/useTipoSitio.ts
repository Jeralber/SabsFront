import { useState, useEffect, useCallback } from 'react';
import { TipoSitio } from '../types/tipo-sitio.types';
import { tipoSitioService } from '../services/tipoSitioService';

interface UseTipoSitioState {
  tiposSitio: TipoSitio[];
  selectedTipoSitio: TipoSitio | null;
  loading: boolean;
  error: string | null;
}

export const useTipoSitio = () => {
  const [state, setState] = useState<UseTipoSitioState>({
    tiposSitio: [],
    selectedTipoSitio: null,
    loading: false,
    error: null
  });

  const fetchTiposSitio = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoSitioService.getAll();
      setState(prev => ({
        ...prev,
        tiposSitio: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar tipos de sitio'
      }));
    }
  }, []);

  const fetchTipoSitioById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoSitioService.getById(id);
      setState(prev => ({
        ...prev,
        selectedTipoSitio: response.data as TipoSitio,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar tipo de sitio con ID ${id}`
      }));
    }
  }, []);

  const createTipoSitio = useCallback(async (tipoSitio: Partial<TipoSitio>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoSitioService.create(tipoSitio);
      setState(prev => ({
        ...prev,
        tiposSitio: [...prev.tiposSitio, response.data as TipoSitio],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear tipo de sitio';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateTipoSitio = useCallback(async (id: number, tipoSitio: Partial<TipoSitio>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoSitioService.update(id, tipoSitio);
      const updatedTipoSitio = response.data as TipoSitio;
      setState(prev => ({
        ...prev,
        tiposSitio: prev.tiposSitio.map(t => t.id === id ? updatedTipoSitio : t),
        selectedTipoSitio: prev.selectedTipoSitio?.id === id ? updatedTipoSitio : prev.selectedTipoSitio,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar tipo de sitio con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteTipoSitio = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await tipoSitioService.delete(id);
      setState(prev => ({
        ...prev,
        tiposSitio: prev.tiposSitio.filter(t => t.id !== id),
        selectedTipoSitio: prev.selectedTipoSitio?.id === id ? null : prev.selectedTipoSitio,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar tipo de sitio con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchTiposSitio();
  }, [fetchTiposSitio]);

  return {
    ...state,
    fetchTiposSitio,
    fetchTipoSitioById,
    createTipoSitio,
    updateTipoSitio,
    deleteTipoSitio
  };
};