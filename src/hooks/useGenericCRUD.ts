import { useState, useCallback } from 'react';

interface GenericCRUDState<T> {
  items: T[];
  selectedItem: T | null;
  loading: boolean;
  error: string | null;
}

interface CRUDService<T> {
  getAll: () => Promise<{ data: T[] }>;
  getById: (id: number) => Promise<{ data: T }>;
  create: (item: Partial<T>) => Promise<{ data: T }>;
  update: (id: number, item: Partial<T>) => Promise<{ data: T }>;
  delete: (id: number) => Promise<void>;
}

export const useGenericCRUD = <T extends { id: number }>(
  service: CRUDService<T>,
  entityName: string
) => {
  const [state, setState] = useState<GenericCRUDState<T>>({
    items: [],
    selectedItem: null,
    loading: false,
    error: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, loading: false, error }));
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const response = await service.getAll();
      setState(prev => ({
        ...prev,
        items: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : `Error al cargar ${entityName}s`);
    }
  }, [service, entityName, setLoading, setError]);

  const fetchById = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const response = await service.getById(id);
      setState(prev => ({
        ...prev,
        selectedItem: response.data,
        loading: false
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : `Error al cargar ${entityName} con ID ${id}`);
    }
  }, [service, entityName, setLoading, setError]);

  const create = useCallback(async (item: Partial<T>) => {
    setLoading(true);
    try {
      const response = await service.create(item);
      setState(prev => ({
        ...prev,
        items: [...prev.items, response.data],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al crear ${entityName}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [service, entityName, setLoading, setError]);

  const update = useCallback(async (id: number, item: Partial<T>) => {
    setLoading(true);
    try {
      const response = await service.update(id, item);
      setState(prev => ({
        ...prev,
        items: prev.items.map(existing => 
          existing.id === id ? response.data : existing
        ),
        selectedItem: prev.selectedItem?.id === id ? response.data : prev.selectedItem,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar ${entityName}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [service, entityName, setLoading, setError]);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await service.delete(id);
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id),
        selectedItem: prev.selectedItem?.id === id ? null : prev.selectedItem,
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al eliminar ${entityName}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [service, entityName, setLoading, setError]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedItem: null }));
  }, []);

  return {
    ...state,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    clearError,
    clearSelection,
    // Exportar métodos internos para casos especiales
    setLoading,
    setError,
    setState
  };
};