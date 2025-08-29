import { TipoMaterial } from './tipo-material.types';
import { UnidadMedida } from './unidad-medida.types';
import { CategoriaMaterial } from './categoria-material.types';
import { Detalles } from './detalles.types';
import { Movimiento } from './movimiento.types';
import { Sitio } from './sitio.types';
import { Persona } from './persona.types';
import { Stock } from './stock.types';

export interface Material {
  id: number;
  nombre: string;
  descripcion: string;
  // ❌ ELIMINADO: stock: number;
  caduca: boolean;
  fechaVencimiento?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string;
  tipoMaterialId?: number;
  unidadMedidaId?: number;
  categoriaMaterialId?: number;
  sitioId?: number;
  registradoPorId?: number;
  
  esOriginal: boolean;
  requiereDevolucion: boolean;
  materialOrigenId?: number;
  
  // ✅ NUEVA PROPIEDAD: Para materiales prestados
  cantidadPrestada?: number;
  
  // Relaciones
  tipoMaterial?: TipoMaterial;
  unidadMedida?: UnidadMedida;
  categoriaMaterial?: CategoriaMaterial;
  detalles?: Detalles[];
  movimientos?: Movimiento[];
  sitio?: Sitio;
  registradoPor?: Persona;
  materialOrigen?: Material;
  stocks?: Stock[];
}