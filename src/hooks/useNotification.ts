import { useState, useEffect } from 'react';
import { Notification } from '@/types/notification.types';
import {notificationService} from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { connectNotifications } from '@/lib/socket-notifications';
import { useToast } from '@/hooks/useToast';

export const useNotification = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);
  const [isMarkingOne, setIsMarkingOne] = useState<number | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Obtener desde backend (paginado)
      const res = await notificationService.getMyNotifications({ page: 1, limit: 20 });
      setNotifications(res.data);
    } catch (err) {
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silenciar para no romper la UI si falla momentáneamente
    }
  };

  useEffect(() => {
    if (!user) return;
    // Cargar datos iniciales
    fetchNotifications();
    fetchUnreadCount();

    // Polling de respaldo cada 30s
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // WebSocket: escuchar contador en tiempo real
  useEffect(() => {
    if (!user?.token) return; // Si no hay token, no abrimos socket (quedará el polling)

    const socket = connectNotifications(user.token);

    socket.on('connected', () => {
      // opcional: console.log('Socket notifications conectado');
    });

    socket.on('notifications:count', ({ count }: { count: number }) => {
      setUnreadCount(count);
    });

    // Si quieres reaccionar a cada notificación nueva:
    // socket.on('notification', () => {
    //   fetchNotifications();
    // });

    return () => {
      socket.disconnect();
    };
  }, [user?.token]);

  const markAsRead = async (id: number) => {
    if (isMarkingOne === id) return; // Evita doble clic
    setIsMarkingOne(id);
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, leida: true } : notif));
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
      showSuccess('Notificación marcada como leída');
    } catch (err) {
      setError('Error al marcar como leída');
      showError('Error al marcar la notificación como leída');
    } finally {
      setIsMarkingOne(null);
    }
  };

  const { hasPermission } = usePermissions();

  const filteredNotifications = notifications.filter(notif => {
    // Ejemplo: filtrar por permiso basado en tipo
    if (notif.tipo === 'stock_bajo' && !hasPermission('view_inventario')) return false;
    return true;
  });

  // Fallback local si el socket/count falla (no reemplaza el estado principal)
  const localUnread = filteredNotifications.filter(n => !n.leida).length;

  const markAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
      setUnreadCount(0); // el WS también emitirá count=0, esto es fallback
      showSuccess('Todas las notificaciones marcadas como leídas');
    } catch (err) {
      setError('Error al marcar todas como leídas');
      showError('Error al marcar todas como leídas');
    } finally {
      setIsMarkingAll(false);
    }
  };

  return {
    notifications: filteredNotifications,
    unreadCount: unreadCount ?? localUnread,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    isMarkingAll,
    isMarkingOne
  };
};