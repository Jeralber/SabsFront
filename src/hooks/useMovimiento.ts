import { useState, useCallback } from 'react';
import { Movimiento, CreateMovimientoDto } from '../types/movimiento.types';
import { movimientoService, MovimientosFiltros } from '../services/movimientoService';
import { useMaterial } from './useMaterial';

interface UseMovimientoState {
  movimientos: Movimiento[];
  movimientosPendientes: Movimiento[];
  selectedMovimiento: Movimiento | null;
  loading: boolean;
  error: string | null;
}

export const useMovimiento = () => {
  const { fetchMateriales } = useMaterial();

  const [state, setState] = useState<UseMovimientoState>({
    movimientos: [],
    movimientosPendientes: [],
    selectedMovimiento: null,
    loading: false,
    error: null
  });

  const fetchMovimientos = useCallback(async (filtros?: MovimientosFiltros) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.obtenerTodos(filtros);
      setState(prev => ({
        ...prev,
        movimientos: Array.isArray(response) ? response : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar movimientos'
      }));
    }
  }, []);

  const fetchMovimientosPendientes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.obtenerPendientes();
      setState(prev => ({
        ...prev,
        movimientosPendientes: Array.isArray(response) ? response : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar movimientos pendientes'
      }));
    }
  }, []);

  const fetchMovimientoById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.obtenerPorId(id);
      setState(prev => ({
        ...prev,
        selectedMovimiento: response,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar movimiento con ID ${id}`
      }));
    }
  }, []);

  const createMovimiento = useCallback(async (movimiento: CreateMovimientoDto) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const nuevoMovimiento = await movimientoService.crear(movimiento);
      
      // Refrescar la lista completa en lugar de agregar manualmente
      await fetchMovimientos();
      await fetchMateriales();
      
      setState(prev => ({ ...prev, loading: false }));
      return nuevoMovimiento;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear movimiento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, [fetchMateriales, fetchMovimientos]);

  const aprobarMovimiento = useCallback(async (id: number, aprobadorId: number, observaciones?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.aprobar(id, aprobadorId, observaciones);
      
      // ✅ CORRECCIÓN: Actualización inmediata y forzada de materiales
      await fetchMateriales(); // Primera actualización
      
      // ✅ NUEVO: Segunda actualización con delay para asegurar sincronización
      setTimeout(async () => {
        await fetchMateriales();
      }, 500);
      
      // Actualizar listas de movimientos
      await fetchMovimientos();
      await fetchMovimientosPendientes();
      
      setState(prev => ({
        ...prev,
        selectedMovimiento: prev.selectedMovimiento?.id === id ? response : prev.selectedMovimiento,
        loading: false
      }));
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al aprobar movimiento con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, [fetchMateriales, fetchMovimientos, fetchMovimientosPendientes]);

  const rechazarMovimiento = useCallback(async (id: number, aprobadorId: number, observaciones?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.rechazar(id, aprobadorId, observaciones);
      setState(prev => ({
        ...prev,
        movimientos: prev.movimientos.map(m => m.id === id ? response : m),
        movimientosPendientes: prev.movimientosPendientes.filter(m => m.id !== id),
        selectedMovimiento: prev.selectedMovimiento?.id === id ? response : prev.selectedMovimiento,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al rechazar movimiento con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  return {
    ...state,
    fetchMovimientos,
    fetchMovimientosPendientes,
    fetchMovimientoById,
    createMovimiento,
    aprobarMovimiento,
    rechazarMovimiento
  };
};