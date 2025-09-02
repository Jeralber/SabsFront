import React, { useState, useEffect } from 'react';
import { X, Plus, Package, Check, Trash2, Eye, EyeOff, Info, Edit } from 'lucide-react';
import Swal from 'sweetalert2';
import { useStock } from '../../hooks/useStock';
import { useToast } from '../../hooks/useToast';
import { CreateStockDto } from '../../types/stock.types';
import { Material } from '../../types/material.types';

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material;
  onStockUpdated?: () => void;
}

export function StockManagementModal({
  isOpen,
  onClose,
  material,
  onStockUpdated
}: StockManagementModalProps) {
  const { showSuccess, showError } = useToast();
  const {
    stocks,
    loading,
    fetchByMaterial,
    createStock,
    updateStock,
    activateStock,
    deactivateStock,
    deleteStock,
    fetchTotalActiveStock,
  } = useStock();

  // Estados del formulario
  const [formData, setFormData] = useState({
    cantidad: 1,
    codigo: '',
    requiereCodigo: true,
    noPoseeCodigo: false
  });
  
  const [totalActiveStock, setTotalActiveStock] = useState(0);
  const [showInactive, setShowInactive] = useState(false);

  // ✅ NUEVO: Sin límites fijos - el stock se maneja dinámicamente
  // Ya no hay validaciones basadas en material.stock
  // El sistema permite agregar stock libremente según las necesidades

  useEffect(() => {
    if (isOpen && material.id) {
      fetchByMaterial(material.id);
      loadTotalActiveStock();
    }
  }, [isOpen, material.id]);

  const loadTotalActiveStock = async () => {
    try {
      const total = await fetchTotalActiveStock(material.id);
      setTotalActiveStock(total);
    } catch (error) {
      console.error('Error al cargar stock total:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ NUEVA VALIDACIÓN: Solo validaciones básicas, sin límites fijos
    if (formData.cantidad <= 0) {
      showError('La cantidad debe ser mayor a 0');
      return;
    }
    
    try {
      const stockData: CreateStockDto = {
        materialId: material.id,
        cantidad: formData.cantidad,
        requiereCodigo: !formData.noPoseeCodigo,
        codigo: formData.noPoseeCodigo ? undefined : formData.codigo,
        // NUEVO: asociar al sitio del material
        sitioId: material.sitioId
      };

      const newStock = await createStock(stockData);
      
      // Si no requiere código, activar inmediatamente
      if (formData.noPoseeCodigo && newStock?.data.id) {
        await activateStock(newStock.data.id);
      }

      // Resetear formulario
      setFormData({
        cantidad: 1,
        codigo: '',
        requiereCodigo: true,
        noPoseeCodigo: false
      });

      // Recargar datos
      await fetchByMaterial(material.id);
      await loadTotalActiveStock();
      
      if (onStockUpdated) {
        onStockUpdated();
      }

      showSuccess(`Se agregó ${formData.cantidad} unidad(es) al stock${formData.noPoseeCodigo ? ' y se activó automáticamente' : ''}`);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error desconocido al agregar stock');
    }
  };

  const handleActivateStock = async (stockId: number, codigo?: string) => {
    try {
      await activateStock(stockId, codigo);
      await fetchByMaterial(material.id);
      await loadTotalActiveStock();
      
      if (onStockUpdated) {
        onStockUpdated();
      }

      showSuccess('El stock ha sido activado exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error desconocido al activar stock');
    }
  };

  const handleDeactivateStock = async (stockId: number) => {
    try {
      await deactivateStock(stockId);
      await fetchByMaterial(material.id);
      await loadTotalActiveStock();
      
      if (onStockUpdated) {
        onStockUpdated();
      }

      showSuccess('El stock ha sido desactivado exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error desconocido al desactivar stock');
    }
  };

  const handleDeleteStock = async (stockId: number) => {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return;

    const result = await Swal.fire({
      title: '¿Eliminar stock?',
      text: `¿Está seguro de que desea eliminar este stock de ${stock.cantidad} unidad(es)${stock.codigo ? ` con código "${stock.codigo}"` : ''}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteStock(stockId);
        await fetchByMaterial(material.id);
        await loadTotalActiveStock();
        
        if (onStockUpdated) {
          onStockUpdated();
        }

        showSuccess('El stock ha sido eliminado exitosamente');
        
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El stock ha sido eliminado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Error desconocido al eliminar stock');
        
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el stock. Inténtelo nuevamente.',
          icon: 'error'
        });
      }
    }
  };

  const handleEditCode = async (stockId: number) => {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return;

    const { value: newCode } = await Swal.fire({
      title: 'Editar código',
      input: 'text',
      inputLabel: 'Nuevo código',
      inputValue: stock.codigo || '',
      inputPlaceholder: 'Ingrese el nuevo código (opcional)',
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        return null;
      }
    });

    if (newCode !== undefined) {
      try {
        await updateStock(stockId, { codigo: newCode || undefined });
        await fetchByMaterial(material.id);
        
        if (onStockUpdated) {
          onStockUpdated();
        }

        showSuccess('Código actualizado exitosamente');
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Error al actualizar el código');
      }
    }
  };

  const activeStocks = stocks.filter(stock => stock.activo);
  const displayedStocks = showInactive ? stocks : activeStocks;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestionar Stock - {material.nombre}
              </h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Stock activo total: {totalActiveStock}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Entidades de stock: {stocks.length}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
          {/* Formulario de agregar stock */}
          <div className="lg:w-1/3 p-6 border-r border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Agregar Stock
            </h3>
            
            {/* ✅ NUEVA INFORMACIÓN: Sin límites fijos */}
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Sistema Dinámico</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Puedes agregar stock según las necesidades. El sistema maneja entidades de stock individuales sin límites fijos.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ingresa la cantidad que deseas agregar al stock
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="noPoseeCodigo"
                    checked={formData.noPoseeCodigo}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      noPoseeCodigo: e.target.checked,
                      codigo: e.target.checked ? '' : prev.codigo
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="noPoseeCodigo" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    No posee código (activar automáticamente)
                  </label>
                </div>

                {!formData.noPoseeCodigo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Código (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Ingrese código si es necesario"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || formData.cantidad <= 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-4 w-4" />
                {loading ? 'Agregando...' : 'Agregar Stock'}
              </button>
            </form>
          </div>

          {/* Lista de stock existente */}
          <div className="lg:w-2/3 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Stock Existente
              </h3>
              <button
                onClick={() => setShowInactive(!showInactive)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {showInactive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : displayedStocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {showInactive ? 'No hay stock registrado' : 'No hay stock activo'}
              </div>
            ) : (
              <div className="space-y-3">
                {displayedStocks.map((stock) => (
                  <div
                    key={stock.id}
                    className={`p-4 rounded-lg border ${
                      stock.activo
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            stock.activo
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {stock.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            Cantidad: {stock.cantidad}
                          </span>
                          {stock.codigo && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Código: {stock.codigo}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Creado: {new Date(stock.fechaCreacion).toLocaleDateString()}
                          {stock.requiereCodigo ? ' • Requiere código' : ' • Sin código requerido'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!stock.activo && (
                          <>
                            <button
                              onClick={() => handleEditCode(stock.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                              title="Editar código"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleActivateStock(stock.id)}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors"
                              title="Activar stock"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {stock.activo && (
                          <button
                            onClick={() => handleDeactivateStock(stock.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded-lg transition-colors"
                            title="Desactivar stock"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteStock(stock.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg transition-colors"
                          title="Eliminar stock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}