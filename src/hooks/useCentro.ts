import { useState, useEffect, useCallback } from 'react';
import { Centro } from '../types/centro.types';
import { centroService } from '../services/centroService';

interface UseCentroState {
  centros: Centro[];
  selectedCentro: Centro | null;
  loading: boolean;
  error: string | null;
}

export const useCentro = () => {
  const [state, setState] = useState<UseCentroState>({
    centros: [],
    selectedCentro: null,
    loading: false,
    error: null
  });

  const fetchCentros = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await centroService.getAll();
      setState(prev => ({
        ...prev,
        centros: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar centros'
      }));
    }
  }, []);

  const fetchCentroById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await centroService.getById(id);
      setState(prev => ({
        ...prev,
        selectedCentro: response.data as Centro,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar centro con ID ${id}`
      }));
    }
  }, []);

  const createCentro = useCallback(async (centro: Partial<Centro>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await centroService.create(centro);
      setState(prev => ({
        ...prev,
        centros: [...prev.centros, response.data as Centro],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear centro';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateCentro = useCallback(async (id: number, centro: Partial<Centro>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await centroService.update(id, centro);
      const updatedCentro = response.data as Centro;
      setState(prev => ({
        ...prev,
        centros: prev.centros.map(c => c.id === id ? updatedCentro : c),
        selectedCentro: prev.selectedCentro?.id === id ? updatedCentro : prev.selectedCentro,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar centro con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteCentro = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await centroService.delete(id);
      setState(prev => ({
        ...prev,
        centros: prev.centros.filter(c => c.id !== id),
        selectedCentro: prev.selectedCentro?.id === id ? null : prev.selectedCentro,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar centro con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchCentros();
  }, [fetchCentros]);

  return {
    ...state,
    fetchCentros,
    fetchCentroById,
    createCentro,
    updateCentro,
    deleteCentro
  };
};