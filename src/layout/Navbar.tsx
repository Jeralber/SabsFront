import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/molecules/ThemeToggle";
import { Bars3Icon } from "@heroicons/react/24/outline";

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-green-600 dark:bg-green-800 shadow px-6 py-3 flex justify-between items-center border-b border-white fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="text-white hover:bg-green-700 p-2 rounded-md"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white dark:text-white">Sistema de Inventario</h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {user && (
          <div className="text-sm text-white dark:text-white text-right">
            <p className="font-semibold">{user.usuario.nombre}</p>
            <p className="text-xs">{user.usuario.rol}</p>
          </div>
        )}

        <button
          onClick={logout}
          className="text-sm text-green-700 bg-white px-3 py-1 rounded hover:bg-gray-100 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};