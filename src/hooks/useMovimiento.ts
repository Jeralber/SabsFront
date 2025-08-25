import { useState,  useCallback } from 'react';
import { Movimiento,  } from '../types/movimiento.types';
import { movimientoService, MovimientosPaginados } from '../services/movimientoService';
import { useMaterial } from './useMaterial'; // Para refrescar materiales si es necesario


interface UseMovimientoState {
  movimientos: Movimiento[];
  movimientosPaginados: MovimientosPaginados | null;
  selectedMovimiento: Movimiento | null;
  loading: boolean;
  error: string | null;
}

export const useMovimiento = () => {
  const { fetchMateriales } = useMaterial(); // Para refrescar después de actualización

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
    // Verifica si se necesita solicitud antes de crear
    if (!movimiento.solicitudId) {
      // Lógica para manejar sin solicitud, o crea una si es necesario, pero evita extras
      console.warn('Creando movimiento sin solicitud asociada');
    }
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const nuevoMovimiento = await movimientoService.crear(movimiento);
      console.log('Movimiento recibido:', nuevoMovimiento);
      if (!nuevoMovimiento || typeof nuevoMovimiento !== 'object' || !nuevoMovimiento.id) {
        console.error('Validación falló para:', nuevoMovimiento);
        throw new Error('No se recibió un movimiento válido en la respuesta');
      }
      setState(prev => ({
        ...prev,
        movimientos: [...prev.movimientos, nuevoMovimiento],
        loading: false
      }));
      await fetchMateriales(); // Refrescar materiales después de crear
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
  }, [fetchMateriales]);

  const createMovimientoConSolicitud = useCallback(async (movimiento: Partial<Movimiento> & { solicitudId?: number }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.crearConSolicitud(movimiento);
      const nuevoMovimiento = response.data;
      console.log('Movimiento con solicitud recibido:', nuevoMovimiento);
      if (!nuevoMovimiento || typeof nuevoMovimiento !== 'object' || !nuevoMovimiento.id) {
        console.error('Validación falló para movimiento con solicitud:', nuevoMovimiento);
        throw new Error('No se recibió un movimiento válido en la respuesta');
      }
      setState(prev => ({
        ...prev,
        movimientos: [...prev.movimientos, nuevoMovimiento],
        loading: false
      }));
      return { data: nuevoMovimiento };
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

  const aprobarMovimiento = useCallback(async (id: number, aprobadorId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.aprobar(id, aprobadorId);
      const updatedMovimiento = response;
      setState(prev => ({
        ...prev,
        movimientos: prev.movimientos.map(m => m.id === id ? updatedMovimiento : m),
        selectedMovimiento: prev.selectedMovimiento?.id === id ? updatedMovimiento : prev.selectedMovimiento,
        loading: false
      }));
      await fetchMateriales(); // Refrescar después de aprobar
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
  }, []);
  
  // En el return
  return {
    ...state,
    fetchMovimientos,
    fetchMovimientoById,
    createMovimiento,
    createMovimientoConSolicitud,
    updateMovimiento,
    deleteMovimiento,
    aprobarMovimiento
  };
};