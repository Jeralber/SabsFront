import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMaterial } from '../hooks/useMaterial';
import { useMovimiento } from '../hooks/useMovimiento';
import { useSitio } from '../hooks/useSitio';
import { Material } from '../types/material.types';
import { Movimiento } from '../types/movimiento.types';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Package, User, Calendar, ArrowLeft, AlertCircle } from 'lucide-react';

const MaterialesPorSitioPage: React.FC = () => {
  const { sitioId } = useParams<{ sitioId: string }>();
  const navigate = useNavigate();
  const { materiales, loading: matLoading, error: matError } = useMaterial();
  const { movimientos, loading: movLoading, error: movError } = useMovimiento();
  const { sitios } = useSitio();

  if (matLoading || movLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (matError || movError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los datos
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {matError || movError}
          </div>
        </div>
      </div>
    );
  }

  const sitioActual = sitios.find(s => s.id === Number(sitioId));
  const materialesFiltrados: Material[] = materiales.filter(
    (mat: Material) => mat.sitioId === Number(sitioId)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="h-8 w-8 text-green-600" />
            Materiales - {sitioActual?.nombre || `Sitio ${sitioId}`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Inventario de materiales con información del creador y movimientos
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materialesFiltrados.map((mat: Material) => {
          const stockTotal = mat.stocks 
            ? mat.stocks.filter(stock => stock.activo).reduce((total, stock) => total + stock.cantidad, 0)
            : 0;
            
          const movsRelacionados: Movimiento[] = movimientos.filter(
            (mov: Movimiento) => mov.materialId === mat.id
          );
          const movimientosPendientes = movimientos.filter(
            mov => mov.estado === 'NO_APROBADO' && mov.materialId === mat.id
          );

          return (
            <Card key={mat.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex gap-3">
                <div className="bg-green-500 text-white p-3 rounded-lg">
                  <Package className="h-8 w-8" />
                </div>
                <div className="flex flex-col">
                  <p className="text-lg font-semibold">{mat.nombre}</p>
                  <p className="text-sm text-gray-500">{mat.descripcion}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stockTotal > 10
                        ? "bg-green-100 text-green-800"
                        : stockTotal > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      Stock: {stockTotal}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {/* Información del creador */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800 dark:text-blue-200">
                      Registrado por:
                    </span>
                  </div>
                  <p className="text-sm">
                    {mat.registradoPor ? 
                      `${mat.registradoPor.nombre} ${mat.registradoPor.apellido}` : 
                      'Administrador del Sistema'
                    }
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {new Date(mat.fechaCreacion).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>

                {/* Movimientos relacionados */}
                {movsRelacionados.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2">Movimientos de este Material:</h3>
                    {movsRelacionados.slice(0, 3).map((mov: Movimiento) => (
                      <div key={mov.id} className={`mt-2 p-2 rounded ${
                        mov.estado === 'APROBADO' ? 'bg-green-100 text-green-800' :
                        mov.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        <p className="font-medium">
                          {mov.tipoMovimiento?.nombre}: {mov.cantidad} unidades
                        </p>
                        <p className="text-sm">
                          Estado: <span className="font-semibold">{mov.estado}</span>
                        </p>
                        <p className="text-sm">
                          Solicitante: {mov.solicitante?.nombre} {mov.solicitante?.apellido}
                        </p>
                        {mov.sitioDestino && (
                          <p className="text-sm">
                            Destino: {mov.sitioDestino.nombre}
                          </p>
                        )}
                      </div>
                    ))}
                    {movsRelacionados.length > 3 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Y {movsRelacionados.length - 3} movimientos más...
                      </p>
                    )}
                  </div>
                )}

                {/* Movimientos pendientes */}
                {movimientosPendientes.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Movimientos Pendientes:</h3>
                    {movimientosPendientes.map((mov: Movimiento) => (
                      <div key={mov.id} className="mt-2 p-2 bg-yellow-100 rounded">
                        <p className="text-sm">Tipo: {mov.tipoMovimiento?.nombre}</p>
                        <p className="text-sm">Cantidad: {mov.cantidad}</p>
                        <p className="text-sm">
                          Solicitante: {mov.solicitante?.nombre} {mov.solicitante?.apellido}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {materialesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay materiales en este sitio
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Los materiales aparecerán aquí una vez que sean registrados en este sitio
          </p>
        </div>
      )}
    </div>
  );
};

export default MaterialesPorSitioPage;