import { useState, useEffect, useCallback } from 'react';
import { Detalles } from '../types/detalles.types';
import { detallesService } from '../services/detallesService';

interface UseDetallesState {
  detalles: Detalles[];
  selectedDetalle: Detalles | null;
  loading: boolean;
  error: string | null;
}

export const useDetalles = () => {
  const [state, setState] = useState<UseDetallesState>({
    detalles: [],
    selectedDetalle: null,
    loading: false,
    error: null
  });

  const fetchDetalles = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.getAll();
      setState(prev => ({
        ...prev,
        detalles: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar detalles'
      }));
    }
  }, []);

  const fetchDetalleById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.getById(id);
      setState(prev => ({
        ...prev,
        selectedDetalle: response.data as Detalles,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar detalle con ID ${id}`
      }));
    }
  }, []);

  const createDetalle = useCallback(async (detalle: Partial<Detalles>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.create(detalle);
      setState(prev => ({
        ...prev,
        detalles: [...prev.detalles, response.data as Detalles],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear detalle';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateDetalle = useCallback(async (id: number, detalle: Partial<Detalles>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.update(id, detalle);
      const updatedDetalle = response.data as Detalles;
      setState(prev => ({
        ...prev,
        detalles: prev.detalles.map(d => d.id === id ? updatedDetalle : d),
        selectedDetalle: prev.selectedDetalle?.id === id ? updatedDetalle : prev.selectedDetalle,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar detalle con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteDetalle = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await detallesService.delete(id);
      setState(prev => ({
        ...prev,
        detalles: prev.detalles.filter(d => d.id !== id),
        selectedDetalle: prev.selectedDetalle?.id === id ? null : prev.selectedDetalle,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar detalle con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchDetalles();
  }, [fetchDetalles]);

  return {
    ...state,
    fetchDetalles,
    fetchDetalleById,
    createDetalle,
    updateDetalle,
    deleteDetalle
  };
};