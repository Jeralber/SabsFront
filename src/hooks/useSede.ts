import { useState, useEffect, useCallback } from 'react';
import { Sede } from '../types/sede.types';
import { sedeService } from '../services/sedeService';

interface UseSedeState {
  sedes: Sede[];
  selectedSede: Sede | null;
  loading: boolean;
  error: string | null;
}

export const useSede = () => {
  const [state, setState] = useState<UseSedeState>({
    sedes: [],
    selectedSede: null,
    loading: false,
    error: null
  });

  const fetchSedes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await sedeService.getAll();
      setState(prev => ({
        ...prev,
        sedes: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar sedes'
      }));
    }
  }, []);

  const fetchSedeById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await sedeService.getById(id);
      setState(prev => ({
        ...prev,
        selectedSede: response.data as Sede,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar sede con ID ${id}`
      }));
    }
  }, []);

  const createSede = useCallback(async (sede: Partial<Sede>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await sedeService.create(sede);
      setState(prev => ({
        ...prev,
        sedes: [...prev.sedes, response.data as Sede],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear sede';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateSede = useCallback(async (id: number, sede: Partial<Sede>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await sedeService.update(id, sede);
      const updatedSede = response.data as Sede;
      setState(prev => ({
        ...prev,
        sedes: prev.sedes.map(s => s.id === id ? updatedSede : s),
        selectedSede: prev.selectedSede?.id === id ? updatedSede : prev.selectedSede,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar sede con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteSede = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await sedeService.delete(id);
      setState(prev => ({
        ...prev,
        sedes: prev.sedes.filter(s => s.id !== id),
        selectedSede: prev.selectedSede?.id === id ? null : prev.selectedSede,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar sede con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchSedes();
  }, [fetchSedes]);

  return {
    ...state,
    fetchSedes,
    fetchSedeById,
    createSede,
    updateSede,
    deleteSede
  };
};