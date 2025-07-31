import { useState, useCallback } from 'react';
import { Detalles } from '../types/detalles.types';
import { detallesService, CreateDetallesDto } from '../services/detallesService';

interface UseDetallesState {
  detalles: Detalles[];
  historial: any[]; // Agregar para el historial
  selectedDetalle: Detalles | null;
  loading: boolean;
  error: string | null;
}

export const useDetalles = () => {
  const [state, setState] = useState<UseDetallesState>({
    detalles: [],
    historial: [], // Agregar
    selectedDetalle: null,
    loading: false,
    error: null
  });

  const fetchDetalles = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.obtenerTodos();
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
      const response = await detallesService.obtenerPorId(id);
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

  const createDetalle = useCallback(async (detalle: CreateDetallesDto) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.crear(detalle);
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

  const updateDetalle = useCallback(async (id: number, detalle: Partial<CreateDetallesDto>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.actualizar(id, detalle);
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
      await detallesService.eliminar(id);
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

  const aprobarDetalle = useCallback(async (id: number, personaApruebaId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.aprobar(id, personaApruebaId);
      const updatedDetalle = response.data as Detalles;
      setState(prev => ({
        ...prev,
        detalles: prev.detalles.map(d => d.id === id ? updatedDetalle : d),
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al aprobar detalle con ID ${id}`;
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, []);

  const rechazarDetalle = useCallback(async (id: number, personaApruebaId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.rechazar(id, personaApruebaId);
      const updatedDetalle = response.data as Detalles;
      setState(prev => ({
        ...prev,
        detalles: prev.detalles.map(d => d.id === id ? updatedDetalle : d),
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al rechazar detalle con ID ${id}`;
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, []);

  const fetchHistorialCompleto = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.obtenerHistorialCompleto();
      setState(prev => ({
        ...prev,
        historial: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar historial'
      }));
    }
  }, []);

  const fetchHistorialPorPersona = useCallback(async (personaId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.obtenerHistorialPorPersona(personaId);
      setState(prev => ({
        ...prev,
        historial: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar historial de persona ${personaId}`
      }));
    }
  }, []);

  return {
    ...state,
    fetchDetalles,
    fetchDetalleById,
    createDetalle,
    updateDetalle,
    deleteDetalle,
    aprobarDetalle,
    rechazarDetalle,
    fetchHistorialCompleto,
    fetchHistorialPorPersona
  };
};