import { useState, useEffect, useCallback } from 'react';
import { Solicitud } from '../types/solicitud.types';
import { solicitudService, MovimientoSolicitud, ResumenSolicitud } from '../services/solicitudService';

interface UseSolicitudState {
  solicitudes: Solicitud[];
  selectedSolicitud: Solicitud | null;
  movimientos: MovimientoSolicitud[];
  resumen: ResumenSolicitud | null;
  loading: boolean;
  error: string | null;
}

interface SolicitudFilters {
  aprobada?: boolean;
  personaSolicitaId?: number;
}

export const useSolicitud = () => {
  const [state, setState] = useState<UseSolicitudState>({
    solicitudes: [],
    selectedSolicitud: null,
    movimientos: [],
    resumen: null,
    loading: false,
    error: null
  });

  const fetchSolicitudes = useCallback(async (filters?: SolicitudFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await solicitudService.obtenerTodas(filters);
      setState(prev => ({
        ...prev,
        solicitudes: data,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar solicitudes'
      }));
    }
  }, []);

  const fetchSolicitudById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await solicitudService.obtenerPorId(id);
      setState(prev => ({
        ...prev,
        selectedSolicitud: data,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar solicitud con ID ${id}`
      }));
    }
  }, []);

  const createSolicitud = useCallback(async (solicitud: Partial<Solicitud>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await solicitudService.crear(solicitud);
      setState(prev => ({
        ...prev,
        solicitudes: [...prev.solicitudes, data],
        loading: false
      }));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear solicitud';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const aprobarSolicitud = useCallback(async (id: number, aprobadorId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await solicitudService.aprobar(id, aprobadorId);
      setState(prev => ({
        ...prev,
        solicitudes: prev.solicitudes.map(s => s.id === id ? data : s),
        selectedSolicitud: prev.selectedSolicitud?.id === id ? data : prev.selectedSolicitud,
        loading: false
      }));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al aprobar solicitud con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const entregarSolicitud = useCallback(async (id: number, encargadoId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await solicitudService.entregar(id, encargadoId);
      setState(prev => ({
        ...prev,
        solicitudes: prev.solicitudes.map(s => s.id === id ? data : s),
        selectedSolicitud: prev.selectedSolicitud?.id === id ? data : prev.selectedSolicitud,
        loading: false
      }));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al entregar solicitud con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const devolverSolicitud = useCallback(async (id: number, encargadoId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await solicitudService.devolver(id, encargadoId);
      setState(prev => ({
        ...prev,
        solicitudes: prev.solicitudes.map(s => s.id === id ? data : s),
        selectedSolicitud: prev.selectedSolicitud?.id === id ? data : prev.selectedSolicitud,
        loading: false
      }));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al devolver solicitud con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const rechazarSolicitud = useCallback(async (id: number, aprobadorId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await solicitudService.rechazar(id, aprobadorId);
      setState(prev => ({
        ...prev,
        solicitudes: prev.solicitudes.map(s => s.id === id ? data : s),
        selectedSolicitud: prev.selectedSolicitud?.id === id ? data : prev.selectedSolicitud,
        loading: false
      }));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al rechazar solicitud con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const fetchMovimientos = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await solicitudService.obtenerMovimientos(id);
      setState(prev => ({
        ...prev,
        movimientos: data,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar movimientos de la solicitud con ID ${id}`
      }));
    }
  }, []);

  const fetchResumen = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await solicitudService.obtenerResumen(id);
      setState(prev => ({
        ...prev,
        resumen: data,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar resumen de la solicitud con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  // Añadir estas funciones antes del return
  const updateSolicitud = useCallback(async (id: number, solicitud: Partial<Solicitud>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await solicitudService.actualizar(id, solicitud);
      setState(prev => ({
        ...prev,
        solicitudes: prev.solicitudes.map(s => s.id === id ? data : s),
        selectedSolicitud: prev.selectedSolicitud?.id === id ? data : prev.selectedSolicitud,
        loading: false
      }));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar solicitud con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);
  
  const deleteSolicitud = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await solicitudService.eliminar(id);
      setState(prev => ({
        ...prev,
        solicitudes: prev.solicitudes.filter(s => s.id !== id),
        selectedSolicitud: prev.selectedSolicitud?.id === id ? null : prev.selectedSolicitud,
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al eliminar solicitud con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);
  
  // Y añadirlas al return
  return {
    ...state,
    fetchSolicitudes,
    fetchSolicitudById,
    createSolicitud,
    updateSolicitud,
    deleteSolicitud,
    aprobarSolicitud,
    entregarSolicitud,
    devolverSolicitud,
    rechazarSolicitud,
    fetchMovimientos,
    fetchResumen
  };
};