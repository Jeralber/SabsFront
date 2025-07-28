import { useState, useEffect, useCallback } from 'react';
import { AreaCentro } from '../types/area-centro.types';
import { areacentroService } from '../services/areacentroService';

interface UseAreaCentroState {
  areasCentro: AreaCentro[];
  selectedAreaCentro: AreaCentro | null;
  loading: boolean;
  error: string | null;
}

export const useAreaCentro = () => {
  const [state, setState] = useState<UseAreaCentroState>({
    areasCentro: [],
    selectedAreaCentro: null,
    loading: false,
    error: null
  });

  const fetchAreasCentro = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await areacentroService.getAll();
      setState(prev => ({
        ...prev,
        areasCentro: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar áreas-centro'
      }));
    }
  }, []);

  const fetchAreaCentroById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await areacentroService.getById(id);
      setState(prev => ({
        ...prev,
        selectedAreaCentro: response.data as AreaCentro,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar área-centro con ID ${id}`
      }));
    }
  }, []);

  const createAreaCentro = useCallback(async (areaCentro: Partial<AreaCentro>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await areacentroService.create(areaCentro);
      setState(prev => ({
        ...prev,
        areasCentro: [...prev.areasCentro, response.data as AreaCentro],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear área-centro';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateAreaCentro = useCallback(async (id: number, areaCentro: Partial<AreaCentro>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await areacentroService.update(id, areaCentro);
      const updatedAreaCentro = response.data as AreaCentro;
      setState(prev => ({
        ...prev,
        areasCentro: prev.areasCentro.map(ac => ac.id === id ? updatedAreaCentro : ac),
        selectedAreaCentro: prev.selectedAreaCentro?.id === id ? updatedAreaCentro : prev.selectedAreaCentro,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar área-centro con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteAreaCentro = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await areacentroService.delete(id);
      setState(prev => ({
        ...prev,
        areasCentro: prev.areasCentro.filter(ac => ac.id !== id),
        selectedAreaCentro: prev.selectedAreaCentro?.id === id ? null : prev.selectedAreaCentro,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar área-centro con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchAreasCentro();
  }, [fetchAreasCentro]);

  return {
    ...state,
    fetchAreasCentro,
    fetchAreaCentroById,
    createAreaCentro,
    updateAreaCentro,
    deleteAreaCentro
  };
};