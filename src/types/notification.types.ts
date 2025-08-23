export interface Notification {
  id: number;
  tipo: 'movimiento' | 'caducidad' | 'stock_bajo' | 'nuevo_material';
  mensaje: string;
  usuarioId: number;
  leida: boolean;
  fecha: string;
  relacionadoId?: number;
}