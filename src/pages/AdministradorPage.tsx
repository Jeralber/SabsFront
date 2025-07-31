import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Settings, Shield, Users, Key, Link, Database, UserCheck } from 'lucide-react';

import ModuloPage from './ModuloPage';
import OpcionPage from './OpcionPage';
import RolPage from './RolPage';
import PermisoPage from './PermisoPage';
import RolPermisoOpcionPage from './RolPermisoOpcionPage';
import GestionPermisosRolPage from './GestionPermisosRolPage';

type AdminSection = 'modulo' | 'opcion' | 'rol' | 'permiso' | 'rol-permiso-opcion' | 'gestion-permisos-rol' | null;

const AdministradorPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>(null);

  const adminCards = [
    {
      id: 'modulo' as AdminSection,
      title: 'Módulos',
      description: 'Gestiona los módulos del sistema',
      icon: <Database className="h-8 w-8" />,
      color: 'bg-blue-500'
    },
    {
      id: 'opcion' as AdminSection,
      title: 'Opciones',
      description: 'Administra las opciones de menú',
      icon: <Link className="h-8 w-8" />,
      color: 'bg-green-500'
    },
    {
      id: 'rol' as AdminSection,
      title: 'Roles',
      description: 'Configura los roles de usuario',
      icon: <Users className="h-8 w-8" />,
      color: 'bg-purple-500'
    },
    {
      id: 'permiso' as AdminSection,
      title: 'Permisos',
      description: 'Define los permisos del sistema',
      icon: <Key className="h-8 w-8" />,
      color: 'bg-orange-500'
    },
    {
      id: 'rol-permiso-opcion' as AdminSection,
      title: 'Rol Permiso Opciones',
      description: 'Asigna permisos a roles y opciones',
      icon: <Shield className="h-8 w-8" />,
      color: 'bg-red-500'
    },
    {
      id: 'gestion-permisos-rol' as AdminSection,
      title: 'Gestión de Permisos por Rol',
      description: 'Asignar permisos a roles de forma masiva',
      icon: <UserCheck size={24} />,
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600'
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'modulo':
        return <ModuloPage />;
      case 'opcion':
        return <OpcionPage />;
      case 'rol':
        return <RolPage />;
      case 'permiso':
        return <PermisoPage />;
      case 'rol-permiso-opcion':
        return <RolPermisoOpcionPage />;
      case 'gestion-permisos-rol':
        return <GestionPermisosRolPage />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Panel de Administración
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los componentes principales del sistema
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

      {/* Tarjetas de administración */}
      {!activeSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card) => (
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
                  <Settings className="h-4 w-4 text-gray-400" />
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

export default AdministradorPage;