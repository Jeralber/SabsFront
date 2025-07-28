import { useState, useEffect, useCallback } from 'react';
import { Sitio } from '../types/sitio.types';
import { sitioService } from '../services/sitioService';

interface UseSitioState {
  sitios: Sitio[];
  selectedSitio: Sitio | null;
  loading: boolean;
  error: string | null;
}

export const useSitio = () => {
  const [state, setState] = useState<UseSitioState>({
    sitios: [],
    selectedSitio: null,
    loading: false,
    error: null
  });

  const fetchSitios = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await sitioService.getAll();
      setState(prev => ({
        ...prev,
        sitios: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar sitios'
      }));
    }
  }, []);

  const fetchSitioById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await sitioService.getById(id);
      setState(prev => ({
        ...prev,
        selectedSitio: response.data as Sitio,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar sitio con ID ${id}`
      }));
    }
  }, []);

  const createSitio = useCallback(async (sitio: Partial<Sitio>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await sitioService.create(sitio);
      setState(prev => ({
        ...prev,
        sitios: [...prev.sitios, response.data as Sitio],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear sitio';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateSitio = useCallback(async (id: number, sitio: Partial<Sitio>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await sitioService.update(id, sitio);
      const updatedSitio = response.data as Sitio;
      setState(prev => ({
        ...prev,
        sitios: prev.sitios.map(s => s.id === id ? updatedSitio : s),
        selectedSitio: prev.selectedSitio?.id === id ? updatedSitio : prev.selectedSitio,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar sitio con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteSitio = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await sitioService.delete(id);
      setState(prev => ({
        ...prev,
        sitios: prev.sitios.filter(s => s.id !== id),
        selectedSitio: prev.selectedSitio?.id === id ? null : prev.selectedSitio,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar sitio con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchSitios();
  }, [fetchSitios]);

  return {
    ...state,
    fetchSitios,
    fetchSitioById,
    createSitio,
    updateSitio,
    deleteSitio
  };
};