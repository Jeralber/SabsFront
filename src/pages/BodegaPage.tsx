import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Warehouse } from 'lucide-react';
import { useTipoSitio } from '../hooks/useTipoSitio';
import { TipoSitio } from '../types/tipo-sitio.types';
import { useNavigate } from 'react-router-dom';

const BodegaPage: React.FC = () => {
  const { tiposSitio, loading, error } = useTipoSitio();
  const navigate = useNavigate();

  if (loading) return <div>Cargando tipos de sitios...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bodega - Tipos de Sitios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiposSitio.map((tipo: TipoSitio) => (
          <Card
            key={tipo.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            isPressable
            onPress={() => navigate(`/bodega/tipo/${tipo.id}/sitios`)}
          >
            <CardHeader className="flex gap-3">
              <div className="bg-blue-500 text-white p-3 rounded-lg">
                <Warehouse className="h-8 w-8" />
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">{tipo.nombre}</p>
                <p className="text-sm text-gray-500">Sitios: {tipo.sitios?.length || 0}</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600">Estado: {tipo.activo ? 'Activo' : 'Inactivo'}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BodegaPage;