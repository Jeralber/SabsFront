import { useState, useEffect, useCallback } from 'react';
import { TipoMovimiento } from '../types/tipo-movimiento.types';
import { tipoMovimientoService } from '../services/tipoMovimientoService';

interface UseTipoMovimientoState {
  tiposMovimiento: TipoMovimiento[];
  selectedTipoMovimiento: TipoMovimiento | null;
  loading: boolean;
  error: string | null;
}

export const useTipoMovimiento = () => {
  const [state, setState] = useState<UseTipoMovimientoState>({
    tiposMovimiento: [],
    selectedTipoMovimiento: null,
    loading: false,
    error: null
  });

  const fetchTiposMovimiento = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoMovimientoService.getAll();
      setState(prev => ({
        ...prev,
        tiposMovimiento: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar tipos de movimiento'
      }));
    }
  }, []);

  const fetchTipoMovimientoById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoMovimientoService.getById(id);
      setState(prev => ({
        ...prev,
        selectedTipoMovimiento: response.data as TipoMovimiento,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar tipo de movimiento con ID ${id}`
      }));
    }
  }, []);

  const createTipoMovimiento = useCallback(async (tipoMovimiento: Partial<TipoMovimiento>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoMovimientoService.create(tipoMovimiento);
      setState(prev => ({
        ...prev,
        tiposMovimiento: [...prev.tiposMovimiento, response.data as TipoMovimiento],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear tipo de movimiento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateTipoMovimiento = useCallback(async (id: number, tipoMovimiento: Partial<TipoMovimiento>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await tipoMovimientoService.update(id, tipoMovimiento);
      const updatedTipoMovimiento = response.data as TipoMovimiento;
      setState(prev => ({
        ...prev,
        tiposMovimiento: prev.tiposMovimiento.map(t => t.id === id ? updatedTipoMovimiento : t),
        selectedTipoMovimiento: prev.selectedTipoMovimiento?.id === id ? updatedTipoMovimiento : prev.selectedTipoMovimiento,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar tipo de movimiento con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteTipoMovimiento = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await tipoMovimientoService.delete(id);
      setState(prev => ({
        ...prev,
        tiposMovimiento: prev.tiposMovimiento.filter(t => t.id !== id),
        selectedTipoMovimiento: prev.selectedTipoMovimiento?.id === id ? null : prev.selectedTipoMovimiento,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar tipo de movimiento con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchTiposMovimiento();
  }, [fetchTiposMovimiento]);

  return {
    ...state,
    fetchTiposMovimiento,
    fetchTipoMovimientoById,
    createTipoMovimiento,
    updateTipoMovimiento,
    deleteTipoMovimiento
  };
};