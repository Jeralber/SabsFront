import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/molecules/ThemeToggle';
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/hooks/useNotification';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications, markAsRead, unreadCount, markAllAsRead, isMarkingAll, isMarkingOne } = useNotification(); 

  return (
    <nav className="bg-green-600 dark:bg-green-800 shadow px-6 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-white hover:bg-green-700 p-2 rounded-md"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white dark:text-white">SABS</h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="text-white hover:bg-green-700 p-2 rounded-md relative"
            aria-label="Notificaciones"
          >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
              {unreadCount > 0 && (
                <div className="px-4 py-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Tienes {unreadCount} sin leer</span>
                  <button
                    onClick={markAllAsRead}
                    disabled={isMarkingAll}
                    className={`text-xs text-green-600 dark:text-green-400 hover:underline ${isMarkingAll ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isMarkingAll ? 'Marcando...' : 'Marcar todas como leídas'}
                  </button>
                </div>
              )}
              {notifications.length === 0 ? (
                <p className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">No hay notificaciones</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-2 text-sm ${notif.leida ? 'text-gray-500' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer ${isMarkingOne === notif.id ? 'opacity-50 cursor-wait pointer-events-none' : ''}`}
                    onClick={() => {
                      if (!notif.leida && isMarkingOne !== notif.id) markAsRead(notif.id);
                      setIsNotificationsOpen(false);
                    }}
                  >
                    <p className="font-semibold">{notif.tipo}</p>
                    <p>{notif.mensaje}</p>
                    <p className="text-xs text-gray-400">{new Date(notif.fecha).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {user && (
          <div className="text-sm text-white dark:text-white text-right">
            <p className="font-semibold">{user.usuario.nombre}</p>
            <p className="text-xs">{user.usuario.rol}</p>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 text-white hover:bg-green-700 px-3 py-2 rounded-md transition"
          >
            <span className="text-sm">Opciones</span>
            <ChevronDownIcon className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/acerca-de');
                }}
              >
                <InformationCircleIcon className="h-4 w-4" />
                Acerca de
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
