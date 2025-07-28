import { useState, useEffect, useCallback } from 'react';
import { Titulado } from '../types/titulado.types';
import { tituladoService } from '../services/tituladoService';

interface UseTituladoState {
  titulados: Titulado[];
  selectedTitulado: Titulado | null;
  loading: boolean;
  error: string | null;
}

export const useTitulado = () => {
  const [state, setState] = useState<UseTituladoState>({
    titulados: [],
    selectedTitulado: null,
    loading: false,
    error: null
  });

  const fetchTitulados = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tituladoService.getAll();
      setState(prev => ({
        ...prev,
        titulados: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar titulados'
      }));
    }
  }, []);

  const fetchTituladoById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tituladoService.getById(id);
      setState(prev => ({
        ...prev,
        selectedTitulado: response.data as Titulado,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar titulado con ID ${id}`
      }));
    }
  }, []);

  const createTitulado = useCallback(async (titulado: Partial<Titulado>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tituladoService.create(titulado);
      setState(prev => ({
        ...prev,
        titulados: [...prev.titulados, response.data as Titulado],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear titulado';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateTitulado = useCallback(async (id: number, titulado: Partial<Titulado>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tituladoService.update(id, titulado);
      const updatedTitulado = response.data as Titulado;
      setState(prev => ({
        ...prev,
        titulados: prev.titulados.map(t => t.id === id ? updatedTitulado : t),
        selectedTitulado: prev.selectedTitulado?.id === id ? updatedTitulado : prev.selectedTitulado,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar titulado con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteTitulado = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await tituladoService.delete(id);
      setState(prev => ({
        ...prev,
        titulados: prev.titulados.filter(t => t.id !== id),
        selectedTitulado: prev.selectedTitulado?.id === id ? null : prev.selectedTitulado,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar titulado con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchTitulados();
  }, [fetchTitulados]);

  return {
    ...state,
    fetchTitulados,
    fetchTituladoById,
    createTitulado,
    updateTitulado,
    deleteTitulado
  };
};