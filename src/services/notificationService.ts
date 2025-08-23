import axios from "@/lib/axios";
import { Notification } from '../types/notification.types';

const API_URL = '/notificaciones';

export const notificationService = {
  getForUser: async (userId: number): Promise<Notification[]> => {
    const response = await axios.get<Notification[]>(`${API_URL}/usuario/${userId}`);
    return response.data;
  },
  create: async (data: Partial<Notification>): Promise<Notification> => {
    const response = await axios.post<Notification>(API_URL, data);
    return response.data;
  },
  markAsRead: async (id: number): Promise<Notification> => {
    const response = await axios.patch<Notification>(`${API_URL}/${id}/read`);
    return response.data;
  },
  // Agrega más métodos según sea necesario, como getUnreadCount, etc.
};