import { useState, useEffect, useCallback } from 'react';
import { Opcion } from '../types/opcion.types';
import { opcionService } from '../services/opcionService';

interface UseOpcionState {
  opciones: Opcion[];
  opcionesConPermisos: Opcion[];
  selectedOpcion: Opcion | null;
  loading: boolean;
  error: string | null;
}

export const useOpcion = () => {
  const [state, setState] = useState<UseOpcionState>({
    opciones: [],
    opcionesConPermisos: [],
    selectedOpcion: null,
    loading: false,
    error: null
  });

  const fetchOpciones = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await opcionService.getAll();
      setState(prev => ({
        ...prev,
        opciones: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar opciones'
      }));
    }
  }, []);

  const fetchOpcionesConPermisos = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await opcionService.getAllWithPermisos();
      setState(prev => ({
        ...prev,
        opcionesConPermisos: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar opciones con permisos'
      }));
    }
  }, []);

  const fetchOpcionById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await opcionService.getById(id);
      setState(prev => ({
        ...prev,
        selectedOpcion: response.data as Opcion,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar opción con ID ${id}`
      }));
    }
  }, []);

  const createOpcion = useCallback(async (opcion: Partial<Opcion>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await opcionService.create(opcion);
      setState(prev => ({
        ...prev,
        opciones: [...prev.opciones, response.data as Opcion],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear opción';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateOpcion = useCallback(async (id: number, opcion: Partial<Opcion>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await opcionService.update(id, opcion);
      const updatedOpcion = response.data as Opcion;
      setState(prev => ({
        ...prev,
        opciones: prev.opciones.map(o => o.id === id ? updatedOpcion : o),
        selectedOpcion: prev.selectedOpcion?.id === id ? updatedOpcion : prev.selectedOpcion,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar opción con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteOpcion = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await opcionService.delete(id);
      setState(prev => ({
        ...prev,
        opciones: prev.opciones.filter(o => o.id !== id),
        selectedOpcion: prev.selectedOpcion?.id === id ? null : prev.selectedOpcion,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar opción con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchOpciones();
  }, [fetchOpciones]);

  return {
    ...state,
    fetchOpciones,
    fetchOpcionesConPermisos,
    fetchOpcionById,
    createOpcion,
    updateOpcion,
    deleteOpcion
  };
};