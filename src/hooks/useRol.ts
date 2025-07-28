import { useState, useEffect, useCallback } from 'react';
import { Rol } from '../types/rol.types';
import { rolService } from '../services/rolService';

interface UseRolState {
  roles: Rol[];
  rolesConPermisosYOpciones: Rol[];
  selectedRol: Rol | null;
  loading: boolean;
  error: string | null;
}

export const useRol = () => {
  const [state, setState] = useState<UseRolState>({
    roles: [],
    rolesConPermisosYOpciones: [],
    selectedRol: null,
    loading: false,
    error: null
  });

  const fetchRoles = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await rolService.getAll();
      setState(prev => ({
        ...prev,
        roles: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar roles'
      }));
    }
  }, []);

  const fetchRolesConPermisosYOpciones = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await rolService.getAllWithPermisosYOpciones();
      setState(prev => ({
        ...prev,
        rolesConPermisosYOpciones: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar roles con permisos y opciones'
      }));
    }
  }, []);

  const fetchRolById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await rolService.getById(id);
      setState(prev => ({
        ...prev,
        selectedRol: response.data as Rol,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar rol con ID ${id}`
      }));
    }
  }, []);

  const createRol = useCallback(async (rol: Partial<Rol>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await rolService.create(rol);
      setState(prev => ({
        ...prev,
        roles: [...prev.roles, response.data as Rol],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear rol';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateRol = useCallback(async (id: number, rol: Partial<Rol>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await rolService.update(id, rol);
      const updatedRol = response.data as Rol;
      setState(prev => ({
        ...prev,
        roles: prev.roles.map(r => r.id === id ? updatedRol : r),
        selectedRol: prev.selectedRol?.id === id ? updatedRol : prev.selectedRol,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar rol con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteRol = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await rolService.delete(id);
      setState(prev => ({
        ...prev,
        roles: prev.roles.filter(r => r.id !== id),
        selectedRol: prev.selectedRol?.id === id ? null : prev.selectedRol,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar rol con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    ...state,
    fetchRoles,
    fetchRolesConPermisosYOpciones,
    fetchRolById,
    createRol,
    updateRol,
    deleteRol
  };
};