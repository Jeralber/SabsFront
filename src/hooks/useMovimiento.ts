import { useState, useEffect, useCallback } from 'react';
import { Movimiento,  } from '../types/movimiento.types';
import { movimientoService, MovimientosPaginados } from '../services/movimientoService';


interface UseMovimientoState {
  movimientos: Movimiento[];
  movimientosPaginados: MovimientosPaginados | null;
  selectedMovimiento: Movimiento | null;
  loading: boolean;
  error: string | null;
}

export const useMovimiento = () => {
  const [state, setState] = useState<UseMovimientoState>({
    movimientos: [],
    movimientosPaginados: null,
    selectedMovimiento: null,
    loading: false,
    error: null
  });

  const fetchMovimientos = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.obtenerTodos();
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

  const fetchMovimientoById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.obtenerPorId(id);
      setState(prev => ({
        ...prev,
        selectedMovimiento: response as Movimiento,
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

  const createMovimiento = useCallback(async (movimiento: Partial<Movimiento>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.crear(movimiento);
      setState(prev => ({
        ...prev,
        movimientos: [...prev.movimientos, response as Movimiento],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear movimiento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const createMovimientoConSolicitud = useCallback(async (movimiento: Partial<Movimiento> & { solicitudId?: number }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.crearConSolicitud(movimiento);
      setState(prev => ({
        ...prev,
        movimientos: [...prev.movimientos, response.data.movimiento],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear movimiento con solicitud';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateMovimiento = useCallback(async (id: number, movimiento: Partial<Movimiento>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.actualizar(id, movimiento);
      const updatedMovimiento = response as Movimiento;
      setState(prev => ({
        ...prev,
        movimientos: prev.movimientos.map(m => m.id === id ? updatedMovimiento : m),
        selectedMovimiento: prev.selectedMovimiento?.id === id ? updatedMovimiento : prev.selectedMovimiento,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar movimiento con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteMovimiento = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await movimientoService.eliminar(id);
      setState(prev => ({
        ...prev,
        movimientos: prev.movimientos.filter(m => m.id !== id),
        selectedMovimiento: prev.selectedMovimiento?.id === id ? null : prev.selectedMovimiento,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar movimiento con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  return {
    ...state,
    fetchMovimientos,
   // filtrarMovimientos,
    fetchMovimientoById,
    createMovimiento,
    createMovimientoConSolicitud, // Agregar este método
    updateMovimiento,
    deleteMovimiento
  };
};