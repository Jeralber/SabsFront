import { useState, useCallback } from 'react';
import { Movimiento, CreateMovimientoDto } from '../types/movimiento.types';
import { movimientoService, MovimientosFiltros } from '../services/movimientoService';
import { useMaterial } from './useMaterial';
import { Material } from '../types/material.types';

interface UseMovimientoState {
  movimientos: Movimiento[];
  movimientosPendientes: Movimiento[];
  selectedMovimiento: Movimiento | null;
  loading: boolean;
  error: string | null;
}

export const useMovimiento = () => {
  const { 
    fetchMateriales, 
    materiales, 
    refreshAfterDevolucion
  } = useMaterial();

  const [state, setState] = useState<UseMovimientoState>({
    movimientos: [],
    movimientosPendientes: [],
    selectedMovimiento: null,
    loading: false,
    error: null
  });

  // Mover la función validarDevolucion dentro del hook
  const validarDevolucion = useCallback((materialId: number, cantidad: number) => {
    const material = materiales.find((m: Material) => m.id === materialId);
    
    if (!material) {
      throw new Error('Material no encontrado');
    }
    
    if (material.esOriginal) {
      throw new Error('No se puede devolver un material original');
    }
    
    if (!material.cantidadPrestada || material.cantidadPrestada <= 0) {
      throw new Error('Este material no tiene cantidad pendiente de devolución');
    }
    
    if (cantidad > material.cantidadPrestada) {
      throw new Error(`Cantidad excede lo prestado. Máximo: ${material.cantidadPrestada}`);
    }
  }, [materiales]);

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

  // ✅ NUEVO MÉTODO: Aprobar movimiento y cambiar estado del material
  const aprobarMovimientoYCambiarEstado = useCallback(async (
    movimientoId: number, 
    materialId: number, 
    nuevoEstado: boolean, 
    aprobadorId: number, 
    observaciones?: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.aprobarYCambiarEstadoMaterial(
        movimientoId,
        materialId,
        nuevoEstado,
        aprobadorId,
        observaciones
      );
      
      // Actualizar materiales usando el método especializado para devoluciones
      if (!nuevoEstado) { // Si se está desactivando (devolución)
        await refreshAfterDevolucion();
      } else {
        await fetchMateriales();
      }
      
      // Actualizar listas de movimientos
      await fetchMovimientos();
      await fetchMovimientosPendientes();
      
      setState(prev => ({
        ...prev,
        selectedMovimiento: prev.selectedMovimiento?.id === movimientoId ? response.movimiento : prev.selectedMovimiento,
        loading: false
      }));
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al aprobar movimiento y cambiar estado del material`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, [fetchMateriales, fetchMovimientos, fetchMovimientosPendientes, refreshAfterDevolucion]);

  const aprobarMovimiento = useCallback(async (id: number, aprobadorId: number, observaciones?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await movimientoService.aprobar(id, aprobadorId, observaciones);
      
      // Actualización normal para movimientos que no son devoluciones
      await fetchMateriales();
      
      // Segunda actualización con delay
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
    aprobarMovimientoYCambiarEstado, // ✅ NUEVO método exportado
    rechazarMovimiento,
    validarDevolucion 
  };
};