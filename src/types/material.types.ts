import { TipoMaterial } from './tipo-material.types';
import { UnidadMedida } from './unidad-medida.types';
import { CategoriaMaterial } from './categoria-material.types';
import { Detalles } from './detalles.types';
import { Movimiento } from './movimiento.types';
import { Sitio } from './sitio.types';

export interface Material {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  stock: number;
  caduca: boolean;
  fechaVencimiento?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string;
  tipoMaterialId?: number;
  unidadMedidaId?: number;
  categoriaMaterialId?: number;
  sitioId?: number;
  
  // Relaciones
  tipoMaterial?: TipoMaterial;
  unidadMedida?: UnidadMedida;
  categoriaMaterial?: CategoriaMaterial;
  detalles?: Detalles[];
  movimientos?: Movimiento[];
  sitio?: Sitio;
}