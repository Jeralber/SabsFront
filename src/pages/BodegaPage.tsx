import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Warehouse, ArrowLeft } from "lucide-react";
import { useTipoSitio } from "../hooks/useTipoSitio";
import { TipoSitio } from "../types/tipo-sitio.types";
import { useNavigate } from "react-router-dom";

const BodegaPage: React.FC = () => {
  const { tiposSitio, loading, error } = useTipoSitio();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tipos de sitios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar los tipos de sitios
          </div>
          <div className="text-gray-600 dark:text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bodega - Gestión de Inventario
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra el inventario por tipos de sitios, sitios y materiales
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Volver
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiposSitio.map((tipo: TipoSitio) => (
          <Card
            key={tipo.id}
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-blue-200"
            isPressable
            onPress={() => navigate(`/bodega/tipo/${tipo.id}/sitios`)}
          >
            <CardHeader className="pb-2">
              <div className="bg-blue-500 text-white p-3 rounded-lg w-fit">
                <Warehouse className="h-8 w-8" />
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {tipo.nombre}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                Gestiona los sitios y materiales de este tipo
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tipo.activo
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {tipo.activo ? "Activo" : "Inactivo"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {tipo.sitios?.length || 0} sitios
                  </span>
                </div>
                <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {tiposSitio.length === 0 && (
        <div className="text-center py-12">
          <Warehouse className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay tipos de sitios disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Crea tipos de sitios para comenzar a gestionar tu inventario
          </p>
        </div>
      )}
    </div>
  );
};

export default BodegaPage;