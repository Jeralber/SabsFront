import React from 'react';
import { useParams } from 'react-router-dom';
import { useMaterial } from '../hooks/useMaterial';
import { useMovimiento } from '../hooks/useMovimiento';
import { Material } from '../types/material.types';
import { Movimiento } from '../types/movimiento.types';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Package } from 'lucide-react';

const MaterialesPorSitioPage: React.FC = () => {
  const { sitioId } = useParams<{ sitioId: string }>();
  const { materiales, loading: matLoading, error: matError } = useMaterial();
  const { movimientos, loading: movLoading, error: movError } = useMovimiento();

  if (matLoading || movLoading) return <div>Cargando materiales y movimientos...</div>;
  if (matError) return <div>Error en materiales: {matError}</div>;
  if (movError) return <div>Error en movimientos: {movError}</div>;

  const materialesFiltrados: Material[] = materiales.filter((mat: Material) => mat.sitioId === Number(sitioId));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Materiales para Sitio ID {sitioId}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materialesFiltrados.map((mat: Material) => {
          const movsRelacionados: Movimiento[] = movimientos.filter((mov: Movimiento) => mov.materialId === mat.id);
          return (
            <Card key={mat.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex gap-3">
                <div className="bg-purple-500 text-white p-3 rounded-lg">
                  <Package className="h-8 w-8" />
                </div>
                <div className="flex flex-col">
                  <p className="text-lg font-semibold">{mat.nombre}</p>
                  <p className="text-sm text-gray-500">Stock: {mat.stock}</p>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-gray-600">Descripción: {mat.descripcion}</p>
                {movsRelacionados.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold">Movimientos:</h3>
                    {movsRelacionados.map((mov: Movimiento) => (
                      <div key={mov.id} className="mt-2 p-2 bg-gray-100 rounded">
                        <p>Cantidad: {mov.cantidad}</p>
                        <p>Estado: {mov.estado}</p>
                        <p>Persona: {mov.persona.nombre} {mov.persona.apellido}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MaterialesPorSitioPage;