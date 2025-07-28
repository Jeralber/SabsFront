import { useState, useEffect, useCallback } from 'react';
import { Municipio } from '../types/municipio.types';
import { municipioService } from '../services/municipioService';

interface UseMunicipioState {
  municipios: Municipio[];
  selectedMunicipio: Municipio | null;
  loading: boolean;
  error: string | null;
}

export const useMunicipio = () => {
  const [state, setState] = useState<UseMunicipioState>({
    municipios: [],
    selectedMunicipio: null,
    loading: false,
    error: null
  });

  const fetchMunicipios = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await municipioService.getAll();
      setState(prev => ({
        ...prev,
        municipios: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar municipios'
      }));
    }
  }, []);

  const fetchMunicipioById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await municipioService.getById(id);
      setState(prev => ({
        ...prev,
        selectedMunicipio: response.data as Municipio,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar municipio con ID ${id}`
      }));
    }
  }, []);

  const createMunicipio = useCallback(async (municipio: Partial<Municipio>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await municipioService.create(municipio);
      setState(prev => ({
        ...prev,
        municipios: [...prev.municipios, response.data as Municipio],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear municipio';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updateMunicipio = useCallback(async (id: number, municipio: Partial<Municipio>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await municipioService.update(id, municipio);
      const updatedMunicipio = response.data as Municipio;
      setState(prev => ({
        ...prev,
        municipios: prev.municipios.map(m => m.id === id ? updatedMunicipio : m),
        selectedMunicipio: prev.selectedMunicipio?.id === id ? updatedMunicipio : prev.selectedMunicipio,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar municipio con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deleteMunicipio = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await municipioService.delete(id);
      setState(prev => ({
        ...prev,
        municipios: prev.municipios.filter(m => m.id !== id),
        selectedMunicipio: prev.selectedMunicipio?.id === id ? null : prev.selectedMunicipio,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar municipio con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchMunicipios();
  }, [fetchMunicipios]);

  return {
    ...state,
    fetchMunicipios,
    fetchMunicipioById,
    createMunicipio,
    updateMunicipio,
    deleteMunicipio
  };
};