import { useState, useEffect, useCallback } from 'react';
import { RolPermisoOpcion } from '../types/rol-permiso-opcion.types';
import { rolPermisoOpcionService } from '../services/rolPermisoOpcionService';

interface UseRolPermisoOpcionState {
  rolPermisosOpciones: RolPermisoOpcion[];
  selectedRolPermisoOpcion: RolPermisoOpcion | null;
  loading: boolean;
  error: string | null;
}

export const useRolPermisoOpcion = () => {
  const [state, setState] = useState<UseRolPermisoOpcionState>({
    rolPermisosOpciones: [],
    selectedRolPermisoOpcion: null,
    loading: false,
    error: null
  });

  const fetchRolPermisosOpciones = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await rolPermisoOpcionService.getAll();
      setState(prev => ({
        ...prev,
        rolPermisosOpciones: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar roles-permisos-opciones'
      }));
    }
  }, []);

  const fetchRolPermisoOpcionById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await rolPermisoOpcionService.getById(id);
      setState(prev => ({
        ...prev,
        selectedRolPermisoOpcion: response.data as RolPermisoOpcion,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar rol-permiso-opcion con ID ${id}`
      }));
    }
  }, []);

  const createRolPermisoOpcion = useCallback(async (rolPermisoOpcion: Partial<RolPermisoOpcion>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await rolPermisoOpcionService.create(rolPermisoOpcion);
      setState(prev => ({
        ...prev,
        rolPermisosOpciones: [...prev.rolPermisosOpciones, response.data as RolPermisoOpcion],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear rol-permiso-opcion';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateRolPermisoOpcion = useCallback(async (id: number, rolPermisoOpcion: Partial<RolPermisoOpcion>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await rolPermisoOpcionService.update(id, rolPermisoOpcion);
      const updatedRolPermisoOpcion = response.data as RolPermisoOpcion;
      setState(prev => ({
        ...prev,
        rolPermisosOpciones: prev.rolPermisosOpciones.map(rpo => rpo.id === id ? updatedRolPermisoOpcion : rpo),
        selectedRolPermisoOpcion: prev.selectedRolPermisoOpcion?.id === id ? updatedRolPermisoOpcion : prev.selectedRolPermisoOpcion,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar rol-permiso-opcion con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteRolPermisoOpcion = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await rolPermisoOpcionService.delete(id);
      setState(prev => ({
        ...prev,
        rolPermisosOpciones: prev.rolPermisosOpciones.filter(rpo => rpo.id !== id),
        selectedRolPermisoOpcion: prev.selectedRolPermisoOpcion?.id === id ? null : prev.selectedRolPermisoOpcion,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar rol-permiso-opcion con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchRolPermisosOpciones();
  }, [fetchRolPermisosOpciones]);

  return {
    ...state,
    fetchRolPermisosOpciones,
    fetchRolPermisoOpcionById,
    createRolPermisoOpcion,
    updateRolPermisoOpcion,
    deleteRolPermisoOpcion
  };
};