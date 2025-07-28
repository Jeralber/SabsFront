import { Material } from './material.types';
import { Solicitud } from './solicitud.types';
import { Persona } from './persona.types';

export interface Detalles {
  id: number;
  cantidad: number;
  materialId: number;
  solicitudId?: number;
  personaSolicitaId?: number;
  personaApruebaId?: number;
  personaEncargadaId?: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // Relaciones
  material: Material;
  solicitud?: Solicitud;
  personaSolicita?: Persona;
  personaAprueba?: Persona;
  personaEncargada?: Persona;
}