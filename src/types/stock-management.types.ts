import { Stock, StockFormData } from './stock.types';

// Para el modal de gestión de stock
export interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: number;
  materialName: string;
  onStockUpdated?: () => void;
}

// Para la tabla de stock
export interface StockTableProps {
  stocks: Stock[];
  onActivate: (stockId: number, codigo?: string) => void;
  onDeactivate: (stockId: number) => void;
  onEdit: (stock: Stock) => void;
  onDelete: (stockId: number) => void;
  loading?: boolean;
}

// Para el formulario de stock
export interface StockFormProps {
  initialData?: Partial<Stock>;
  materialId: number;
  onSubmit: (data: StockFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Acciones del stock
export type StockAction = 
  | 'create'
  | 'edit'
  | 'activate'
  | 'deactivate'
  | 'delete';

// Estado del modal
export interface StockModalState {
  action: StockAction | null;
  selectedStock: Stock | null;
  isOpen: boolean;
}