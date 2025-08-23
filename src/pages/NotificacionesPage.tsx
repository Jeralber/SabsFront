import React from 'react';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/atoms/Button';
import { FaBellSlash } from 'react-icons/fa'; // Asumiendo que usas react-icons para un ícono

const NotificacionesPage: React.FC = () => {
  const { notifications, loading, error, markAsRead } = useNotification();

  if (loading) return <div>Cargando notificaciones...</div>;
  if (error) return <div>{error}</div>;

  if (notifications.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <FaBellSlash className="text-6xl text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No hay notificaciones disponibles</h2>
        <p className="text-gray-500">¡Estás al día! Revisa más tarde.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notificaciones</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold text-gray-800">{notification.tipo}</h2>
              <span className={`px-2 py-1 rounded-full text-xs ${notification.leida ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                {notification.leida ? 'Leída' : 'No leída'}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{notification.mensaje}</p>
            <p className="text-sm text-gray-500 mb-4">{notification.fecha}</p>
            {!notification.leida && (
              <Button onClick={() => markAsRead(notification.id)} className="w-full">
                Marcar como leída
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificacionesPage;
