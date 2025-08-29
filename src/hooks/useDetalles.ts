import { useState, useCallback } from 'react';
import { Detalles, DetallesFiltros, EstadisticasDetalles } from '../types/detalles.types';
import { detallesService } from '../services/detallesService';

interface UseDetallesState {
  detalles: Detalles[];
  historialMaterial: Detalles[];
  estadisticas: EstadisticasDetalles | null;
  selectedDetalle: Detalles | null;
  loading: boolean;
  error: string | null;
}

export const useDetalles = () => {
  const [state, setState] = useState<UseDetallesState>({
    detalles: [],
    historialMaterial: [],
    estadisticas: null,
    selectedDetalle: null,
    loading: false,
    error: null
  });

  const fetchDetalles = useCallback(async (filtros?: DetallesFiltros) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.obtenerTodos(filtros);
      setState(prev => ({
        ...prev,
        detalles: Array.isArray(response) ? response : [],
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
        selectedDetalle: response,
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

  const fetchDetallesPorEstado = useCallback(async (estado: 'NO_APROBADO' | 'APROBADO' | 'RECHAZADO') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.obtenerPorEstado(estado);
      setState(prev => ({
        ...prev,
        detalles: Array.isArray(response) ? response : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar detalles con estado ${estado}`
      }));
    }
  }, []);

  const fetchDetallesPorMovimiento = useCallback(async (movimientoId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.obtenerPorMovimiento(movimientoId);
      setState(prev => ({
        ...prev,
        detalles: Array.isArray(response) ? response : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar detalles del movimiento ${movimientoId}`
      }));
    }
  }, []);

  const fetchHistorialMaterial = useCallback(async (materialId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.obtenerHistorialMaterial(materialId);
      setState(prev => ({
        ...prev,
        historialMaterial: Array.isArray(response) ? response : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar historial del material ${materialId}`
      }));
    }
  }, []);

  const fetchEstadisticas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.obtenerEstadisticas();
      setState(prev => ({
        ...prev,
        estadisticas: response,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar estadísticas'
      }));
    }
  }, []);

  return {
    ...state,
    fetchDetalles,
    fetchDetalleById,
    fetchDetallesPorEstado,
    fetchDetallesPorMovimiento,
    fetchHistorialMaterial,
    fetchEstadisticas
  };
};