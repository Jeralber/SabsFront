import  { useEffect, useState } from 'react';
import { DataTable } from '../molecules/DataTable';
import { GenericForm } from '../molecules/GenericForm';
import { useToast } from '../../hooks/useToast';

interface CRUDPageProps<T> {
  title: string;
  entityName: string;
  columns: any[];
  formFields: any[];
  hook: any;
  actions?: any[];
  // Cambiar el tipo de retorno para que solo sea number
  getRowId: (row: T) => number;
}

export function CRUDPage<T extends { id: number }>({
  title,
  entityName,
  columns,
  formFields,
  hook,
  actions,
  getRowId
}: CRUDPageProps<T>) {
  const { state, fetchAll, create, update, remove } = hook;
  const { items, loading, error } = state;
  const { showSuccess, showError } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await remove(id);
      showSuccess(`${entityName} eliminado exitosamente`);
    } catch (error) {
      showError(`Error al eliminar ${entityName}`);
    }
  };

  const handleSubmit = async (data: Partial<T>) => {
    try {
      if (editingItem) {
        await update(editingItem.id, data);
        showSuccess(`${entityName} actualizado exitosamente`);
      } else {
        await create(data);
        showSuccess(`${entityName} creado exitosamente`);
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      showError(`Error al ${editingItem ? 'actualizar' : 'crear'} ${entityName}`);
    }
  };

  const defaultActions = [
    {
      label: 'Editar',
      onClick: handleEdit,
      variant: 'flat' as const,
      color: 'primary' as const,
      show: () => true
    },
    {
      label: 'Eliminar',
      onClick: (item: T) => handleDelete(item.id),
      variant: 'flat' as const,
      color: 'danger' as const,
      show: () => true
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <DataTable
        data={items}
        title={title}
        columns={columns}
        actions={actions || defaultActions}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        getRowId={getRowId}
      />
      
      {/* Mostrar estados de loading y error fuera del DataTable */}
      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="text-lg">Cargando...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {isFormOpen && (
        <GenericForm
          fields={formFields}
          initialValues={editingItem || {}}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}