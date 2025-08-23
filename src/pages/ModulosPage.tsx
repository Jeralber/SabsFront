import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { FaUsers, FaBuilding, FaTable, FaGraduationCap, FaCity, FaMapMarkerAlt, FaBox } from 'react-icons/fa';

import PersonaPage from './PersonaPage';
import AreaPage from './AreaPage';
import CentroPage from './CentroPage';
import SedePage from './SedePage';
import FichaPage from './FichaPage';
import TituladoPage from './TituladoPage';
import MunicipioPage from './MunicipioPage';
import SitioPage from './SitioPage';
import BodegaPage from './BodegaPage';
import MaterialPage from './MaterialPage';

type ModuloSection = 'personas' | 'areas' | 'centros' | 'sedes' | 'fichas' | 'titulados' | 'municipios' | 'sitios' | 'bodega' | 'materiales' | null;

const ModulosPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ModuloSection>(null);

  const moduloCards = [
    {
      id: 'personas' as ModuloSection,
      title: 'Personas',
      description: 'Gestiona las personas',
      icon: <FaUsers className="h-8 w-8" />,
      color: 'bg-blue-500'
    },
    {
      id: 'areas' as ModuloSection,
      title: 'Áreas',
      description: 'Administra las áreas',
      icon: <FaBuilding className="h-8 w-8" />,
      color: 'bg-green-500'
    },
    {
      id: 'centros' as ModuloSection,
      title: 'Centros',
      description: 'Configura los centros',
      icon: <FaBuilding className="h-8 w-8" />,
      color: 'bg-purple-500'
    },
    {
      id: 'sedes' as ModuloSection,
      title: 'Sedes',
      description: 'Gestiona las sedes',
      icon: <FaBuilding className="h-8 w-8" />,
      color: 'bg-orange-500'
    },
    {
      id: 'fichas' as ModuloSection,
      title: 'Fichas',
      description: 'Administra las fichas',
      icon: <FaTable className="h-8 w-8" />,
      color: 'bg-red-500'
    },
    {
      id: 'titulados' as ModuloSection,
      title: 'Titulados',
      description: 'Gestiona los titulados',
      icon: <FaGraduationCap className="h-8 w-8" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'municipios' as ModuloSection,
      title: 'Municipios',
      description: 'Administra los municipios',
      icon: <FaCity className="h-8 w-8" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'sitios' as ModuloSection,
      title: 'Sitios',
      description: 'Configura los sitios',
      icon: <FaMapMarkerAlt className="h-8 w-8" />,
      color: 'bg-pink-500'
    },
    {
      id: 'bodega' as ModuloSection,
      title: 'Bodega',
      description: 'Gestiona la bodega',
      icon: <FaBox className="h-8 w-8" />,
      color: 'bg-teal-500'
    },
    {
      id: 'materiales' as ModuloSection,
      title: 'Materiales',
      description: 'Administra los materiales',
      icon: <FaBox className="h-8 w-8" />,
      color: 'bg-cyan-500'
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personas':
        return <PersonaPage />;
      case 'areas':
        return <AreaPage />;
      case 'centros':
        return <CentroPage />;
      case 'sedes':
        return <SedePage />;
      case 'fichas':
        return <FichaPage />;
      case 'titulados':
        return <TituladoPage />;
      case 'municipios':
        return <MunicipioPage />;
      case 'sitios':
        return <SitioPage />;
      case 'bodega':
        return <BodegaPage />;
      case 'materiales':
        return <MaterialPage />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Módulos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los módulos del sistema
          </p>
        </div>
        {activeSection && (
          <button
            onClick={() => setActiveSection(null)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Volver
          </button>
        )}
      </div>

      {!activeSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moduloCards.map((card) => (
            <Card
              key={card.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              isPressable
              onPress={() => setActiveSection(card.id)}
            >
              <CardHeader className="flex gap-3">
                <div className={`${card.color} text-white p-3 rounded-lg`}>
                  {card.icon}
                </div>
                <div className="flex flex-col">
                  <p className="text-lg font-semibold">{card.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {card.description}
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Haz clic para gestionar
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {activeSection && (
        <div className="mt-6">
          {renderActiveSection()}
        </div>
      )}
    </div>
  );
};

export default ModulosPage;