import axios from "@/lib/axios";
import { Persona } from '../types/persona.types';

const API_URL = '/personas';

export interface PersonaResponse {
  message: string;
  data: Persona | Persona[] | null;
}

export const personaService = {
  getAll: async (): Promise<PersonaResponse> => {
    const response = await axios.get<PersonaResponse>(API_URL);
    return response.data;
  },

  getById: async (id: number): Promise<PersonaResponse> => {
    const response = await axios.get<PersonaResponse>(`${API_URL}/${id}`);
    return response.data;
  },

  getByEmail: async (email: string): Promise<Persona | null> => {
    try {
      const response = await axios.get<Persona>(`${API_URL}/email/${email}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  create: async (persona: Partial<Persona>): Promise<PersonaResponse> => {
    const response = await axios.post<PersonaResponse>(API_URL, persona);
    return response.data;
  },

  update: async (id: number, persona: Partial<Persona>): Promise<PersonaResponse> => {
    const response = await axios.patch<PersonaResponse>(`${API_URL}/${id}`, persona);
    return response.data;
  },

  delete: async (id: number): Promise<PersonaResponse> => {
    const response = await axios.delete<PersonaResponse>(`${API_URL}/${id}`);
    return response.data;
  }
};