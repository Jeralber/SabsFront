import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSitio } from '../hooks/useSitio';
import { Sitio } from '../types/sitio.types';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Building } from 'lucide-react';

const SitiosPorTipoPage: React.FC = () => {
  const { tipoId } = useParams<{ tipoId: string }>();
  const { sitios, loading, error } = useSitio();
  const navigate = useNavigate();

  if (loading) return <div>Cargando sitios...</div>;
  if (error) return <div>Error: {error}</div>;

  const sitiosFiltrados: Sitio[] = sitios.filter((sitio: Sitio) => sitio.tipoSitioId === Number(tipoId));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sitios para Tipo ID {tipoId}</h1>
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
    </div>
  );
};

export default SitiosPorTipoPage;