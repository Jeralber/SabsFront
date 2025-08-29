// src/layout/Sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { FaChevronDown, FaChevronRight, FaUserCog, FaChartBar, FaTable, FaHome, FaExchangeAlt, FaUsers, FaBuilding, FaMapMarkerAlt, FaGraduationCap, FaCity, FaBox, FaWarehouse, FaFileAlt, FaStore } from 'react-icons/fa';
import { FaBell } from 'react-icons/fa';  // Añadir este import si no existe


interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  requiredPermission?: string;
  module?: string;
}

export const Sidebar = ({ isOpen }: Omit<SidebarProps, 'toggleSidebar'>) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { canAccess, hasPermission } = usePermissions();
  
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    administrador: false,
    models: false,
    sitios: false,
    movimientos: false,
    materiales: false
  });
  
  const isAdmin = user?.usuario?.rol?.toLowerCase() === "admin" || 
                  user?.usuario?.rol?.toLowerCase() === "administrador";

  const sidebarItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      icon: <FaHome className="w-5 h-5" />,
      path: '/',
    },
    {
      title: 'Administrador',
      icon: <FaUserCog className="w-5 h-5" />,
      path: '/administracion',
      requiredPermission: 'admin.access'
    },
    
  /* {
      title: 'Módulos',
      icon: <FaTable className="w-5 h-5" />,
      path: '/modulos',
      module: 'modulos'  
    },*/
    {
      title: 'Models',
      icon: <FaTable className="w-5 h-5" />,
      children: [
        { 
          title: 'Personas', 
          icon: <FaUsers className="w-4 h-4" />, 
          path: '/personas',
          module: 'personas'
        },
        { 
          title: 'Áreas', 
          icon: <FaBuilding className="w-4 h-4" />, 
          path: '/areas',
          module: 'areas'
        },
        { 
          title: 'Centros', 
          icon: <FaBuilding className="w-4 h-4" />, 
          path: '/centros',
          module: 'centros'
        },
        { 
          title: 'Sedes', 
          icon: <FaBuilding className="w-4 h-4" />, 
          path: '/sedes',
          module: 'sedes'
        },
        { 
          title: 'Fichas', 
          icon: <FaTable className="w-4 h-4" />, 
          path: '/fichas',
          module: 'fichas'
        },
        { 
          title: 'Titulados', 
          icon: <FaGraduationCap className="w-4 h-4" />, 
          path: '/titulados',
          module: 'titulados'
        },
        { 
          title: 'Municipios', 
          icon: <FaCity className="w-4 h-4" />, 
          path: '/municipios',
          module: 'municipios'
        },
        {
          title: 'Sitios',
          icon: <FaMapMarkerAlt className="w-4 h-4" />,
          path: '/sitios',
          module: 'sitios'
        },
         {
          title: 'Materiales',
          icon: <FaBox className="w-4 h-4" />,
          path: '/materiales',
          module: 'materiales'
        },
        {
          title: 'Bodega',
          icon: <FaStore className="w-5 h-5" />,
          path: '/bodega',
          module: 'bodega'
        }
       
      ]
    },
    {
      title: 'Movimientos',
      icon: <FaExchangeAlt className="w-5 h-5" />,
      path: '/gestion-inventario',
      module: 'inventario'
    },
    {
      title: 'Gráficos',
      icon: <FaChartBar className="w-5 h-5" />,
      path: '/graficos',
      module: 'graficos'
    },
    {
      title: 'Reportes',
      icon: <FaFileAlt className="w-5 h-5" />,
      path: '/reportes',
      module: 'reportes'
    },
    // Dentro del array sidebarItems, agregar después de los items existentes, por ejemplo después de 'Reportes':
    {
      title: 'Notificaciones',
      icon: <FaBell className="w-5 h-5" />,
      path: '/notificaciones',
      module: 'notificaciones'
    },
  ];

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const hasAccessToItem = (item: SidebarItem): boolean => {
    // Admin tiene acceso a todo
    if (isAdmin) {
      return true;
    }

    // Verificar permiso específico
    if (item.requiredPermission) {
      return hasPermission(item.requiredPermission);
    }

    // Verificar acceso por módulo
    if (item.module) {
      return canAccess(item.module);
    }

    // Si tiene hijos, verificar si al menos uno es accesible
    if (item.children) {
      return item.children.some(child => hasAccessToItem(child));
    }

    return true;
  };

  const renderSidebarItems = (items: SidebarItem[], level = 0) => {
    return items
      .filter(item => hasAccessToItem(item))
      .map((item, index) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus[item.title.toLowerCase()];
        const accessibleChildren = hasChildren ? 
          item.children!.filter(child => hasAccessToItem(child)) : [];
        
        // Si es un menú padre y no tiene hijos accesibles, no mostrarlo
        if (hasChildren && accessibleChildren.length === 0) {
          return null;
        }
        
        return (
          <div key={index} className={`w-full ${level > 0 ? 'pl-4' : ''}`}>
            {item.path && !hasChildren ? (
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-md transition-all ${
                  pathname === item.path
                    ? 'bg-white text-green-700'
                    : 'text-white dark:text-white hover:bg-green-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            ) : (
              <button
                onClick={() => toggleMenu(item.title.toLowerCase())}
                className="flex items-center justify-between w-full p-2 text-white dark:text-white hover:bg-green-700 rounded-md transition-all"
              >
                <div className="flex items-center">
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
                {hasChildren && (
                  <span>
                    {isOpen ? <FaChevronDown className="w-4 h-4" /> : <FaChevronRight className="w-4 h-4" />}
                  </span>
                )}
              </button>
            )}
            
            {hasChildren && isOpen && (
              <div className="mt-1 ml-2">
                {renderSidebarItems(accessibleChildren, level + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  if (!isOpen) {
    return (
      <aside className="fixed top-0 left-0 z-40 h-screen pt-16 w-0 overflow-hidden transition-all duration-300" />
    );
  }

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen pt-16 w-64 bg-green-600 dark:bg-green-800 text-white flex flex-col transition-all duration-300 shadow-lg">
      <div className="flex-1 overflow-y-auto p-4">
        {renderSidebarItems(sidebarItems)}
      </div>
    </aside>
  );
};
