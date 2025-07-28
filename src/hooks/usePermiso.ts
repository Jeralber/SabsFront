import { useState, useEffect, useCallback } from 'react';
import { Permiso } from '../types/permiso.types';
import { permisoService } from '../services/permisoService';

interface UsePermisoState {
  permisos: Permiso[];
  permisosConOpcionYModulo: Permiso[];
  selectedPermiso: Permiso | null;
  loading: boolean;
  error: string | null;
}

export const usePermiso = () => {
  const [state, setState] = useState<UsePermisoState>({
    permisos: [],
    permisosConOpcionYModulo: [],
    selectedPermiso: null,
    loading: false,
    error: null
  });

  const fetchPermisos = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await permisoService.getAll();
      setState(prev => ({
        ...prev,
        permisos: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar permisos'
      }));
    }
  }, []);

  const fetchPermisosConOpcionYModulo = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await permisoService.getAllWithOpcionYModulo();
      setState(prev => ({
        ...prev,
        permisosConOpcionYModulo: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar permisos con opción y módulo'
      }));
    }
  }, []);

  const fetchPermisoById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await permisoService.getById(id);
      setState(prev => ({
        ...prev,
        selectedPermiso: response.data as Permiso,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar permiso con ID ${id}`
      }));
    }
  }, []);

  const createPermiso = useCallback(async (permiso: Partial<Permiso>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await permisoService.create(permiso);
      setState(prev => ({
        ...prev,
        permisos: [...prev.permisos, response.data as Permiso],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear permiso';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updatePermiso = useCallback(async (id: number, permiso: Partial<Permiso>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await permisoService.update(id, permiso);
      const updatedPermiso = response.data as Permiso;
      setState(prev => ({
        ...prev,
        permisos: prev.permisos.map(p => p.id === id ? updatedPermiso : p),
        selectedPermiso: prev.selectedPermiso?.id === id ? updatedPermiso : prev.selectedPermiso,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar permiso con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deletePermiso = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await permisoService.delete(id);
      setState(prev => ({
        ...prev,
        permisos: prev.permisos.filter(p => p.id !== id),
        selectedPermiso: prev.selectedPermiso?.id === id ? null : prev.selectedPermiso,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar permiso con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchPermisos();
  }, [fetchPermisos]);

  return {
    ...state,
    fetchPermisos,
    fetchPermisosConOpcionYModulo,
    fetchPermisoById,
    createPermiso,
    updatePermiso,
    deletePermiso
  };
};