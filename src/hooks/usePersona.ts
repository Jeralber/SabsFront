import { useState, useEffect, useCallback } from 'react';
import { Persona } from '../types/persona.types';
import { personaService} from '../services/personaService';

interface UsePersonaState {
  personas: Persona[];
  selectedPersona: Persona | null;
  loading: boolean;
  error: string | null;
}

export const usePersona = () => {
  const [state, setState] = useState<UsePersonaState>({
    personas: [],
    selectedPersona: null,
    loading: false,
    error: null
  });

  const fetchPersonas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await personaService.getAll();
      setState(prev => ({
        ...prev,
        personas: Array.isArray(response.data) ? response.data : [],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar personas'
      }));
    }
  }, []);

  const fetchPersonaById = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await personaService.getById(id);
      setState(prev => ({
        ...prev,
        selectedPersona: response.data as Persona,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar persona con ID ${id}`
      }));
    }
  }, []);

  const fetchPersonaByEmail = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const persona = await personaService.getByEmail(email);
      setState(prev => ({
        ...prev,
        selectedPersona: persona,
        loading: false
      }));
      return persona;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al cargar persona con email ${email}`
      }));
      return null;
    }
  }, []);

  const createPersona = useCallback(async (persona: Partial<Persona>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await personaService.create(persona);
      setState(prev => ({
        ...prev,
        personas: [...prev.personas, response.data as Persona],
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear persona';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const updatePersona = useCallback(async (id: number, persona: Partial<Persona>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await personaService.update(id, persona);
      const updatedPersona = response.data as Persona;
      setState(prev => ({
        ...prev,
        personas: prev.personas.map(p => p.id === id ? updatedPersona : p),
        selectedPersona: prev.selectedPersona?.id === id ? updatedPersona : prev.selectedPersona,
        loading: false
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al actualizar persona con ID ${id}`;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const deletePersona = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await personaService.delete(id);
      setState(prev => ({
        ...prev,
        personas: prev.personas.filter(p => p.id !== id),
        selectedPersona: prev.selectedPersona?.id === id ? null : prev.selectedPersona,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Error al eliminar persona con ID ${id}`
      }));
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  return {
    ...state,
    fetchPersonas,
    fetchPersonaById,
    fetchPersonaByEmail,
    createPersona,
    updatePersona,
    deletePersona
  };
};