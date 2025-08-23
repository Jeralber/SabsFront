import { useState, useEffect } from 'react';
import { Notification } from '@/types/notification.types';
import {notificationService} from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';


export const useNotification = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!user?.usuario?.id) return;
    setLoading(true);
    try {
      const data = await notificationService.getForUser(user.usuario.id);
      setNotifications(data);
    } catch (err) {
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, leida: true } : notif));
    } catch (err) {
      setError('Error al marcar como leída');
    }
  };

  const { hasPermission } = usePermissions();

  const filteredNotifications = notifications.filter(notif => {
    // Ejemplo: filtrar por permiso basado en tipo
    if (notif.tipo === 'stock_bajo' && !hasPermission('view_inventario')) return false;
    return true;
  });

  return { notifications: filteredNotifications, loading, error, fetchNotifications, markAsRead };
};