import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSitio } from '../hooks/useSitio';
import { Sitio } from '../types/sitio.types';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Building, ArrowLeft } from 'lucide-react';

const SitiosPorTipoPage: React.FC = () => {
  const { tipoId } = useParams<{ tipoId: string }>();
  const { sitios, loading, error } = useSitio();
  const navigate = useNavigate();

  if (loading) return <div>Cargando sitios...</div>;
  if (error) return <div>Error: {error}</div>;

  const sitiosFiltrados: Sitio[] = sitios.filter((sitio: Sitio) => sitio.tipoSitioId === Number(tipoId));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building className="h-8 w-8 text-green-600" />
            Sitios por Tipo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Selecciona un sitio para ver sus materiales
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
        {sitiosFiltrados.map((sitio: Sitio) => (
          <Card
            key={sitio.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            isPressable
            onPress={() => navigate(`/bodega/sitio/${sitio.id}/materiales`)}
          >
            <CardHeader className="flex gap-3">
              <div className="bg-green-500 text-white p-3 rounded-lg">
                <Building className="h-8 w-8" />
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">{sitio.nombre}</p>
                <p className="text-sm text-gray-500">Tipo: {sitio.tipoSitio?.nombre}</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600">Estado: {sitio.activo ? 'Activo' : 'Inactivo'}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {sitiosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay sitios disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No se encontraron sitios para este tipo
          </p>
        </div>
      )}
    </div>
  );
};

export default SitiosPorTipoPage;