import { useState, useEffect, useCallback } from 'react';
import { Modulo } from '../types/modulo.types';
import { moduloService } from '../services/moduloService';

interface UseModuloState {
  modulos: Modulo[];
  selectedModulo: Modulo | null;
  loading: boolean;
  error: string | null;
}

export const useModulo = () => {
  const [state, setState] = useState<UseModuloState>({
    modulos: [],
    selectedModulo: null,
    loading: false,
    error: null
  });

  const fetchModulos = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await moduloService.getAll();
      setState(prev => ({
        ...prev,
        modulos: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar módulos'
      }));
    }
  }, []);

  const fetchModuloById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await moduloService.getById(id);
      setState(prev => ({
        ...prev,
        selectedModulo: response.data as Modulo,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar módulo con ID ${id}`
      }));
    }
  }, []);

  const createModulo = useCallback(async (modulo: Partial<Modulo>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await moduloService.create(modulo);
      setState(prev => ({
        ...prev,
        modulos: [...prev.modulos, response.data as Modulo],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear módulo';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateModulo = useCallback(async (id: number, modulo: Partial<Modulo>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await moduloService.update(id, modulo);
      const updatedModulo = response.data as Modulo;
      setState(prev => ({
        ...prev,
        modulos: prev.modulos.map(m => m.id === id ? updatedModulo : m),
        selectedModulo: prev.selectedModulo?.id === id ? updatedModulo : prev.selectedModulo,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar módulo con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteModulo = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await moduloService.delete(id);
      setState(prev => ({
        ...prev,
        modulos: prev.modulos.filter(m => m.id !== id),
        selectedModulo: prev.selectedModulo?.id === id ? null : prev.selectedModulo,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar módulo con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchModulos();
  }, [fetchModulos]);

  return {
    ...state,
    fetchModulos,
    fetchModuloById,
    createModulo,
    updateModulo,
    deleteModulo
  };
};