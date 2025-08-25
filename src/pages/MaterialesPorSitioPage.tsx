import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMaterial } from '../hooks/useMaterial';
import { useMovimiento } from '../hooks/useMovimiento';
import { useSolicitud } from '../hooks/useSolicitud';
import { useSitio } from '../hooks/useSitio';
import { Material } from '../types/material.types';
import { Movimiento } from '../types/movimiento.types';
import { Solicitud } from '../types/solicitud.types';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Package, User, Calendar, ArrowLeft, AlertCircle } from 'lucide-react';

const MaterialesPorSitioPage: React.FC = () => {
  const { sitioId } = useParams<{ sitioId: string }>();
  const navigate = useNavigate();
  const { materiales, loading: matLoading, error: matError } = useMaterial();
  const { movimientos, loading: movLoading, error: movError } = useMovimiento();
  const { solicitudes, loading: solLoading, error: solError } = useSolicitud();
  const { sitios } = useSitio();

  if (matLoading || movLoading || solLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (matError || movError || solError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los datos
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {matError || movError || solError}
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
          const movsRelacionados: Movimiento[] = movimientos.filter(
            (mov: Movimiento) => mov.materialId === mat.id
          );
          const pendingSolicitudes = solicitudes.filter(
            sol => sol.estado === 'PENDIENTE' && 
            sol.detalles?.some(det => det.materialId === mat.id)
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
                      mat.stock > 10
                        ? "bg-green-100 text-green-800"
                        : mat.stock > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      Stock: {mat.stock}
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

                {/* Movimientos aprobados */}
                {movsRelacionados.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2">Movimientos Recibidos en este Sitio:</h3>
                    {movsRelacionados.map((mov: Movimiento) => (
                      <div key={mov.id} className={`mt-2 p-2 rounded ${
                        mov.estado === 'PRESTADO' ? 'bg-orange-100 text-orange-800' :
                        mov.estado === 'DEVUELTO' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="font-medium">
                          {mov.tipoMovimiento?.nombre}: {mov.cantidad} unidades de {mov.material?.nombre}
                        </p>
                        <p className="text-sm">
                          Estado: <span className="font-semibold">{mov.estado}</span>
                        </p>
                        <p className="text-sm">
                          Ejecutado por: {mov.persona?.nombre} {mov.persona?.apellido}
                        </p>
                        {mov.solicitud && (
                          <div className="text-sm text-gray-600 mt-1">
                            <p>
                              Solicitado por: {mov.solicitud.solicitante?.nombre} {mov.solicitud.solicitante?.apellido}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Solicitudes pendientes */}
                {pendingSolicitudes.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Solicitudes Pendientes:</h3>
                    {pendingSolicitudes.map((sol: Solicitud) => (
                      <div key={sol.id} className="mt-2 p-2 bg-yellow-100 rounded">
                        <p className="text-sm">Descripción: {sol.descripcion}</p>
                        <p className="text-sm">
                          Solicitante: {sol.solicitante?.nombre} {sol.solicitante?.apellido}
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