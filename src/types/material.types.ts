import { TipoMaterial } from './tipo-material.types';
import { UnidadMedida } from './unidad-medida.types';
import { CategoriaMaterial } from './categoria-material.types';
import { Detalles } from './detalles.types';
import { Movimiento } from './movimiento.types';

export interface Material {
  id: number;
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
  
  // Relaciones
  tipoMaterial?: TipoMaterial;
  unidadMedida?: UnidadMedida;
  categoriaMaterial?: CategoriaMaterial;
  detalles?: Detalles[];
  movimientos?: Movimiento[];
}