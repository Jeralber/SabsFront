
import { GenericForm, FieldDefinition } from '../molecules/GenericForm';
import { , CreateStockDto, UpdateStockDto,  } from '../../types/stock.types';

export function StockForm({ 
  stock, 
  materialId, 
  onSubmit, 
  onCancel 
}: StockFormProps) {
  const fields: FieldDefinition<CreateStockDto | UpdateStockDto>[] = [
    {
      name: 'codigo',
      label: 'Código (Opcional)',
      type: 'text',
      required: false,
    },
    {
      name: 'cantidad',
      label: 'Cantidad',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'requiereCodigo',
      label: 'Requiere código obligatorio',
      type: 'checkbox',
      required: false,
    },
  ];

  const initialValues = stock ? {
    codigo: stock.codigo || '',
    cantidad: stock.cantidad,
    requiereCodigo: stock.requiereCodigo,
  } : {
    materialId: materialId,
    codigo: '',
    cantidad: 0,
    requiereCodigo: false,
  };

  return (
    <GenericForm
      fields={fields}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}