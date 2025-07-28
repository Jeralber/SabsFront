// src/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";


interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar = ({ isOpen }: Omit<SidebarProps, 'toggleSidebar'>) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  
  console.log('Usuario completo:', user);
  console.log('Rol del usuario:', user?.usuario?.rol);
  
  // Verificación más flexible del rol de administrador
  const isAdmin = user?.usuario?.rol?.toLowerCase() === "admin" || 
                  user?.usuario?.rol?.toLowerCase() === "administrador";
  
  console.log('Es admin:', isAdmin);

  // Enlaces básicos para todos los usuarios
  const links = [
    { path: "/", label: "Inicio" },
    { path: "/materiales", label: "Materiales" },
    { path: "/personas", label: "Personas" },
    { path: "/municipios", label: "Municipios" },
    { path: "/sedes", label: "Sedes" },
    { path: "/titulados", label: "Titulados" },
    { path: "/sitios", label: "Sitios" },
    { path: "/gestion-inventario", label: "Gestión de Inventario" },
  ];

  const adminLinks = [
    { path: "/administracion", label: "Administración" },
  ];

  // Combinar enlaces según el rol
  const navLinks = isAdmin ? [...links, ...adminLinks] : links;
  
  console.log('Enlaces de navegación:', navLinks);

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen pt-16 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 overflow-hidden'} bg-green-600 dark:bg-green-800 border-r border-white shadow-lg`}
    >
      <div className="p-4 text-xl font-bold text-white dark:text-white border-b border-white">
        Panel
      </div>
      <nav className="px-4 py-2 h-full overflow-y-auto">
        {/* Debug: mostrar información del rol en el sidebar */}
       
        
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-3 py-2 rounded text-sm font-medium mb-1 ${
              pathname === link.path
                ? "bg-white text-green-700 dark:bg-white dark:text-green-800"
                : "text-white dark:text-white hover:bg-green-700 dark:hover:bg-green-900 border border-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
