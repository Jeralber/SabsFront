import { useState, useCallback } from 'react';
import { Detalles, DetallesFiltros } from '../types/detalles.types';
import { detallesService, CreateDetalleDto, UpdateDetalleDto } from '../services/detallesService';

interface UseDetallesState {
  detalles: Detalles[];
  historialMaterial: Detalles[];
  selectedDetalle: Detalles | null;
  loading: boolean;
  error: string | null;
}

export const useDetalles = () => {
  const [state, setState] = useState<UseDetallesState>({
    detalles: [],
    historialMaterial: [],
    selectedDetalle: null,
    loading: false,
    error: null
  });

  // Crear nuevo detalle
  const crearDetalle = useCallback(async (dto: CreateDetalleDto) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.crear(dto);
      setState(prev => ({
        ...prev,
        detalles: [response, ...prev.detalles],
        loading: false
      }));
      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear detalle'
      }));
      throw error;
    }
  }, []);

  // Obtener todos los detalles
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

  // Obtener detalle por ID
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

  // Actualizar detalle
  const actualizarDetalle = useCallback(async (id: number, dto: UpdateDetalleDto) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await detallesService.actualizar(id, dto);
      setState(prev => ({
        ...prev,
        detalles: prev.detalles.map(detalle => 
          detalle.id === id ? response : detalle
        ),
        selectedDetalle: prev.selectedDetalle?.id === id ? response : prev.selectedDetalle,
        loading: false
      }));
      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al actualizar detalle con ID ${id}`
      }));
      throw error;
    }
  }, []);

  // Eliminar detalle
  const eliminarDetalle = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await detallesService.eliminar(id);
      setState(prev => ({
        ...prev,
        detalles: prev.detalles.filter(detalle => detalle.id !== id),
        selectedDetalle: prev.selectedDetalle?.id === id ? null : prev.selectedDetalle,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar detalle con ID ${id}`
      }));
      throw error;
    }
  }, []);

  // Obtener detalles por estado
  const fetchDetallesPorEstado = useCallback(async (estado: string) => {
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

  // Obtener detalles por movimiento
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

  // Obtener historial de material
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

  return {
    ...state,
    // Métodos CRUD principales (sincronizados con backend)
    crearDetalle,
    fetchDetalles,
    fetchDetalleById,
    actualizarDetalle,
    eliminarDetalle,
    // Métodos adicionales (pueden requerir endpoints específicos en el backend)
    fetchDetallesPorEstado,
    fetchDetallesPorMovimiento,
    fetchHistorialMaterial
  };
};