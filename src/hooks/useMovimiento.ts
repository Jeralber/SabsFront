// hooks/useMovimientos.ts
import { useState, useCallback } from 'react';
import { Movimiento } from '../types/movimiento.types';
import { MovimientoService } from '../services/movimientoService';

export const useMovimiento = () => {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchMovimientos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await MovimientoService.getAll();
      setMovimientos(res || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al cargar movimientos');
      console.error('Error fetching movimientos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  
  const createMovimiento = useCallback(async (dto: {
    personaSolicitaId: number;
    sitioOrigenId: number; 
    sitioDestinoId?: number | null;
    detalles: { materialId: number; cantidad: number }[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await MovimientoService.create(dto);
      setMovimientos(prev => [res, ...prev]);
      return res;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear movimiento';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  
  const aprobarMovimiento = useCallback(async (id: number, aprobadoPorId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await MovimientoService.aprobar(id, aprobadoPorId);
      setMovimientos(prev => prev.map(m => (m.id === id ? res : m)));
      return res;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al aprobar movimiento';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

 
  const rechazarMovimiento = useCallback(async (id: number, rechazadoPorId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await MovimientoService.rechazar(id, rechazadoPorId);
      setMovimientos(prev => prev.map(m => (m.id === id ? res : m)));
      return res;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al rechazar movimiento';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const devolverMaterial = useCallback(async (movimientoOrigenId: number, dto: {
    personaSolicitaId: number;
    detalles: { materialId: number; cantidad: number }[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await MovimientoService.devolverMaterial(movimientoOrigenId, dto);
      setMovimientos(prev => [res, ...prev]);
      return res;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al devolver material';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMovimientoById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await MovimientoService.getById(id);
      return res;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar movimiento';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSaldoPendiente = useCallback(async (materialId: number) => {
    try {
      const res = await MovimientoService.getSaldoPendiente(materialId);
      return res.saldoPendiente;
    } catch (err: any) {
      console.error('Error fetching saldo pendiente:', err);
      return 0;
    }
  }, []);

  const getPrestamosActivos = useCallback(async (materialId: number) => {
    setLoading(true);
    setError(null);
    try {
      const prestamos = await MovimientoService.getPrestamosActivos(materialId);
      return prestamos;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al obtener préstamos activos';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    movimientos,
    loading,
    error,
    fetchMovimientos,
    createMovimiento,
    aprobarMovimiento,
    rechazarMovimiento,
    devolverMaterial,
    fetchMovimientoById,
    fetchSaldoPendiente,
    getPrestamosActivos,
  };
};

export const useMovimientos = useMovimiento;