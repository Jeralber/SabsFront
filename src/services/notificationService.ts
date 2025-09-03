import axios from "@/lib/axios";
import { Notification } from '../types/notification.types';

const API_URL = '/notificaciones';

export const notificationService = {
  // (Obsoleto en backend actual) Mantengo por compatibilidad si lo usas en otro sitio
  getForUser: async (userId: number): Promise<Notification[]> => {
    const response = await axios.get<Notification[]>(`${API_URL}/usuario/${userId}`);
    return response.data;
  },

  // Nuevo: mis notificaciones (paginadas/filtradas desde backend)
  getMyNotifications: async (params?: { page?: number; limit?: number; tipo?: string; leida?: boolean }) => {
    const { page = 1, limit = 20, tipo, leida } = params || {};
    const response = await axios.get(`${API_URL}/mis-notificaciones`, {
      params: { page, limit, tipo, leida: typeof leida === 'boolean' ? String(leida) : undefined },
    });
    return response.data as { data: Notification[]; total: number; page: number; limit: number };
  },

  // Nuevo: contador de no leídas del usuario autenticado
  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get<{ count: number }>(`${API_URL}/count`);
    return response.data.count;
  },

  create: async (data: Partial<Notification>): Promise<Notification> => {
    const response = await axios.post<Notification>(API_URL, data);
    return response.data;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await axios.patch<Notification>(`${API_URL}/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await axios.patch(`${API_URL}/read-all`);
  },
};