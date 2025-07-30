// src/layout/Sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FaChevronDown, FaChevronRight, FaUserCog, FaChartBar, FaTable, FaHome, FaExchangeAlt, FaUsers, FaBuilding, FaMapMarkerAlt, FaGraduationCap, FaCity, FaBox } from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
}

export const Sidebar = ({ isOpen }: Omit<SidebarProps, 'toggleSidebar'>) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    administrador: false,
    models: false,
    sitios: false,
    movimientos: false,
    materiales: false
  });
  
  console.log('Usuario completo:', user);
  console.log('Rol del usuario:', user?.usuario?.rol);
  
  const isAdmin = user?.usuario?.rol?.toLowerCase() === "admin" || 
                  user?.usuario?.rol?.toLowerCase() === "administrador";
  
  console.log('Es admin:', isAdmin);

  const sidebarItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      icon: <FaHome className="w-5 h-5" />,
      path: '/'
    },
    {
      title: 'Administrador',
      icon: <FaUserCog className="w-5 h-5" />,
      path: '/administracion'
    },
    {
      title: 'Models',
      icon: <FaTable className="w-5 h-5" />,
      children: [
        { title: 'Personas', icon: <FaUsers className="w-4 h-4" />, path: '/personas' },
        { title: 'Áreas', icon: <FaBuilding className="w-4 h-4" />, path: '/areas' },
        { title: 'Centros', icon: <FaBuilding className="w-4 h-4" />, path: '/centros' },
        { title: 'Sedes', icon: <FaBuilding className="w-4 h-4" />, path: '/sedes' },
        { title: 'Fichas', icon: <FaTable className="w-4 h-4" />, path: '/fichas' },
        { title: 'Titulados', icon: <FaGraduationCap className="w-4 h-4" />, path: '/titulados' },
        { title: 'Municipios', icon: <FaCity className="w-4 h-4" />, path: '/municipios' },
        {
          title: 'Sitios',
          icon: <FaMapMarkerAlt className="w-4 h-4" />,
          path: '/sitios'
        },
        {
          title: 'Materiales',
          icon: <FaBox className="w-4 h-4" />,
          path: '/materiales'
        }
      ]
    },
    {
      title: 'Gestión Inventario',
      icon: <FaExchangeAlt className="w-5 h-5" />,
      path: '/gestion-inventario'
    },
    {
      title: 'Reportes',
      icon: <FaChartBar className="w-5 h-5" />,
      path: '/reportes'
    }
  ];

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const renderSidebarItems = (items: SidebarItem[], level = 0) => {
    return items.map((item, index) => {
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openMenus[item.title.toLowerCase()];
      
      // Filtrar elementos de administrador si no es admin
      if (item.title === 'Administrador' && !isAdmin) {
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
              {item.children && renderSidebarItems(item.children, level + 1)}
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
