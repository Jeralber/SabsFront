import { useState, useEffect, useCallback } from 'react';
import { Solicitud } from '../types/solicitud.types';
import { solicitudService } from '../services/solicitudService';

interface UseSolicitudState {
  solicitudes: Solicitud[];
  selectedSolicitud: Solicitud | null;
  movimientos: any[] | null;
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
    movimientos: null,
    loading: false,
    error: null
  });

  const fetchSolicitudes = useCallback(async (filters?: SolicitudFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await solicitudService.getAll(filters);
      setState(prev => ({
        ...prev,
        solicitudes: Array.isArray(response.data) ? response.data : [],
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
      const response = await solicitudService.getById(id);
      setState(prev => ({
        ...prev,
        selectedSolicitud: response.data as Solicitud,
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
      const response = await solicitudService.create(solicitud);
      setState(prev => ({
        ...prev,
        solicitudes: [...prev.solicitudes, response.data as Solicitud],
        loading: false
      }));
      return response;
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

  const updateSolicitud = useCallback(async (id: number, solicitud: Partial<Solicitud>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await solicitudService.update(id, solicitud);
      const updatedSolicitud = response.data as Solicitud;
      setState(prev => ({
        ...prev,
        solicitudes: prev.solicitudes.map(s => s.id === id ? updatedSolicitud : s),
        selectedSolicitud: prev.selectedSolicitud?.id === id ? updatedSolicitud : prev.selectedSolicitud,
        loading: false
      }));
      return response;
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
      await solicitudService.delete(id);
      setState(prev => ({
        ...prev,
        solicitudes: prev.solicitudes.filter(s => s.id !== id),
        selectedSolicitud: prev.selectedSolicitud?.id === id ? null : prev.selectedSolicitud,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar solicitud con ID ${id}`
      }));
    }
  }, []);

  const aprobarSolicitud = useCallback(async (id: number, aprobadorId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await solicitudService.aprobar(id, aprobadorId);
      const updatedSolicitud = response.data as Solicitud;
      setState(prev => ({
        ...prev,
        solicitudes: prev.solicitudes.map(s => s.id === id ? updatedSolicitud : s),
        selectedSolicitud: prev.selectedSolicitud?.id === id ? updatedSolicitud : prev.selectedSolicitud,
        loading: false
      }));
      return response;
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
      const response = await solicitudService.entregar(id, encargadoId);
      const updatedSolicitud = response.data as Solicitud;
      setState(prev => ({
        ...prev,
        solicitudes: prev.solicitudes.map(s => s.id === id ? updatedSolicitud : s),
        selectedSolicitud: prev.selectedSolicitud?.id === id ? updatedSolicitud : prev.selectedSolicitud,
        loading: false
      }));
      return response;
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
      const response = await solicitudService.devolver(id, encargadoId);
      const updatedSolicitud = response.data as Solicitud;
      setState(prev => ({
        ...prev,
        solicitudes: prev.solicitudes.map(s => s.id === id ? updatedSolicitud : s),
        selectedSolicitud: prev.selectedSolicitud?.id === id ? updatedSolicitud : prev.selectedSolicitud,
        loading: false
      }));
      return response;
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

  const fetchMovimientos = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await solicitudService.getMovimientos(id);
      setState(prev => ({
        ...prev,
        movimientos: Array.isArray(response.data) ? response.data : [],
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

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

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
    fetchMovimientos
  };
};