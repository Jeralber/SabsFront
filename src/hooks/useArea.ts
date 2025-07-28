import { useState, useEffect, useCallback } from 'react';
import { Area } from '../types/area.types';
import { areaService,  } from '../services/areaService';

interface UseAreaState {
  areas: Area[];
  selectedArea: Area | null;
  loading: boolean;
  error: string | null;
}

export const useArea = () => {
  const [state, setState] = useState<UseAreaState>({
    areas: [],
    selectedArea: null,
    loading: false,
    error: null
  });

  const fetchAreas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await areaService.getAll();
      setState(prev => ({
        ...prev,
        areas: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar áreas'
      }));
    }
  }, []);

  const fetchAreaById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await areaService.getById(id);
      setState(prev => ({
        ...prev,
        selectedArea: response.data as Area,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar área con ID ${id}`
      }));
    }
  }, []);

  const createArea = useCallback(async (area: Partial<Area>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await areaService.create(area);
      setState(prev => ({
        ...prev,
        areas: [...prev.areas, response.data as Area],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear área';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateArea = useCallback(async (id: number, area: Partial<Area>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await areaService.update(id, area);
      const updatedArea = response.data as Area;
      setState(prev => ({
        ...prev,
        areas: prev.areas.map(a => a.id === id ? updatedArea : a),
        selectedArea: prev.selectedArea?.id === id ? updatedArea : prev.selectedArea,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar área con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteArea = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await areaService.delete(id);
      setState(prev => ({
        ...prev,
        areas: prev.areas.filter(a => a.id !== id),
        selectedArea: prev.selectedArea?.id === id ? null : prev.selectedArea,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar área con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return {
    ...state,
    fetchAreas,
    fetchAreaById,
    createArea,
    updateArea,
    deleteArea
  };
};