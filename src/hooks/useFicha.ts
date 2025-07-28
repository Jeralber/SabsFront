import { useState, useEffect, useCallback } from 'react';
import { Ficha } from '../types/ficha.types';
import { fichaService } from '../services/fichaService';

interface UseFichaState {
  fichas: Ficha[];
  selectedFicha: Ficha | null;
  loading: boolean;
  error: string | null;
}

export const useFicha = () => {
  const [state, setState] = useState<UseFichaState>({
    fichas: [],
    selectedFicha: null,
    loading: false,
    error: null
  });

  const fetchFichas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fichaService.getAll();
      setState(prev => ({
        ...prev,
        fichas: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar fichas'
      }));
    }
  }, []);

  const fetchFichaById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fichaService.getById(id);
      setState(prev => ({
        ...prev,
        selectedFicha: response.data as Ficha,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar ficha con ID ${id}`
      }));
    }
  }, []);

  const createFicha = useCallback(async (ficha: Partial<Ficha>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fichaService.create(ficha);
      setState(prev => ({
        ...prev,
        fichas: [...prev.fichas, response.data as Ficha],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear ficha';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateFicha = useCallback(async (id: number, ficha: Partial<Ficha>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fichaService.update(id, ficha);
      const updatedFicha = response.data as Ficha;
      setState(prev => ({
        ...prev,
        fichas: prev.fichas.map(f => f.id === id ? updatedFicha : f),
        selectedFicha: prev.selectedFicha?.id === id ? updatedFicha : prev.selectedFicha,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar ficha con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteFicha = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await fichaService.delete(id);
      setState(prev => ({
        ...prev,
        fichas: prev.fichas.filter(f => f.id !== id),
        selectedFicha: prev.selectedFicha?.id === id ? null : prev.selectedFicha,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar ficha con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchFichas();
  }, [fetchFichas]);

  return {
    ...state,
    fetchFichas,
    fetchFichaById,
    createFicha,
    updateFicha,
    deleteFicha
  };
};