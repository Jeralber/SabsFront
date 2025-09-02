import { useState, useEffect, useCallback } from "react";
import {
  Stock,
  CreateStockDto,
  UpdateStockDto,
  ActivateStockDto,
} from "../types/stock.types";
import { stockService } from "../services/stockService";
import { useGenericCRUD } from "./useGenericCRUD";

// Adaptador para hacer compatible stockService con useGenericCRUD
const stockServiceAdapter = {
  getAll: async (): Promise<{ data: Stock[] }> => {
    const response = await stockService.getAll();
    return {
      data: Array.isArray(response.data) ? response.data : [],
    };
  },

  getById: async (id: number): Promise<{ data: Stock }> => {
    const response = await stockService.getById(id);
    if (!response.data || Array.isArray(response.data)) {
      throw new Error("Stock no encontrado");
    }
    return { data: response.data };
  },

  create: async (stock: Partial<Stock>): Promise<{ data: Stock }> => {
    const createDto: CreateStockDto = {
      materialId: stock.materialId!,
      cantidad: stock.cantidad!,
      requiereCodigo: stock.requiereCodigo || false,
      codigo: stock.codigo,
      // NUEVO: transportar sitioId
      sitioId: stock.sitioId as number | undefined,
    };
    const response = await stockService.create(createDto);
    if (!response.data || Array.isArray(response.data)) {
      throw new Error("Error al crear stock");
    }
    return { data: response.data };
  },

  update: async (
    id: number,
    stock: Partial<Stock>
  ): Promise<{ data: Stock }> => {
    const updateDto: UpdateStockDto = {
      cantidad: stock.cantidad,
      codigo: stock.codigo,
      activo: stock.activo,
      requiereCodigo: stock.requiereCodigo,
      // NUEVO: permitir actualizar sitioId
      sitioId: stock.sitioId as number | undefined,
    };
    const response = await stockService.update(id, updateDto);
    if (!response.data || Array.isArray(response.data)) {
      throw new Error("Error al actualizar stock");
    }
    return { data: response.data };
  },

  delete: async (id: number): Promise<void> => {
    await stockService.delete(id);
  },
};

export const useStock = (materialId?: number) => {
  const crud = useGenericCRUD(stockServiceAdapter, "stock");

  // Estados adicionales específicos para stock
  const [stocksByMaterial, setStocksByMaterial] = useState<Stock[]>([]);
  const [activeStocks, setActiveStocks] = useState<Stock[]>([]);
  const [totalActiveStock, setTotalActiveStock] = useState<number>(0);

  // Función para obtener stocks por material - SIN dependencia de crud
  const fetchByMaterial = useCallback(
    async (matId: number) => {
      crud.setLoading(true);
      try {
        const response = await stockService.getByMaterial(matId);
        const stocks = Array.isArray(response.data) ? response.data : [];
        setStocksByMaterial(stocks);
        crud.setState((prev) => ({ ...prev, items: stocks, loading: false }));
      } catch (error) {
        crud.setError(
          error instanceof Error
            ? error.message
            : "Error al cargar stocks por material"
        );
      }
    },
    [] // Remover dependencia de crud
  );

  // Función para obtener stocks activos por material - SIN dependencia de crud
  const fetchActiveByMaterial = useCallback(
    async (matId: number) => {
      crud.setLoading(true);
      try {
        const response = await stockService.getActiveByMaterial(matId);
        const stocks = Array.isArray(response.data) ? response.data : [];
        setActiveStocks(stocks);
      } catch (error) {
        crud.setError(
          error instanceof Error
            ? error.message
            : "Error al cargar stocks activos"
        );
      } finally {
        crud.setLoading(false);
      }
    },
    [] // Remover dependencia de crud
  );

  // Función para obtener total de stock activo - Ya está bien sin dependencias
  const fetchTotalActiveStock = useCallback(
    async (matId: number): Promise<number> => {
      try {
        const response = await stockService.getTotalActiveStock(matId);
        setTotalActiveStock(response.total);
        return response.total;
      } catch (error) {
        console.error("Error al obtener total de stock activo:", error);
        return 0;
      }
    },
    []
  );

  // Función para activar stock - Remover dependencias problemáticas
  const activateStock = useCallback(
    async (id: number, codigo?: string) => {
      crud.setLoading(true);
      try {
        const activateDto: ActivateStockDto = codigo ? { codigo } : {};
        const response = await stockService.activate(id, activateDto);

        // Actualizar el estado local
        crud.setState((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === id ? response.data : item
          ),
          loading: false,
        }));

        if (materialId) {
          await fetchByMaterial(materialId);
          await fetchTotalActiveStock(materialId);
        }

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al activar stock";
        crud.setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [materialId] // Solo materialId como dependencia
  );

  const deactivateStock = useCallback(
    async (id: number) => {
      crud.setLoading(true);
      try {
        const response = await stockService.deactivate(id);
        crud.setState((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === id ? response.data : item
          ),
          loading: false,
        }));

        if (materialId) {
          await fetchByMaterial(materialId);
          await fetchTotalActiveStock(materialId);
        }

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al desactivar stock";
        crud.setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [materialId] // Solo materialId como dependencia
  );

  // useEffect corregido - usar las funciones directamente
  useEffect(() => {
    if (materialId) {
      fetchByMaterial(materialId);
      fetchTotalActiveStock(materialId);
    } else {
      crud.fetchAll();
    }
  }, [materialId]); // Solo materialId como dependencia

  return {
    stocks: crud.items,
    selectedStock: crud.selectedItem,
    loading: crud.loading,
    error: crud.error,
    stocksByMaterial,
    activeStocks,
    totalActiveStock,
    fetchStocks: crud.fetchAll,
    fetchStockById: crud.fetchById,
    createStock: crud.create,
    updateStock: crud.update,
    deleteStock: crud.remove,
    clearError: crud.clearError,
    clearSelection: crud.clearSelection,
    fetchByMaterial,
    fetchActiveByMaterial,
    fetchTotalActiveStock,
    activateStock,
    deactivateStock,
  };
};
