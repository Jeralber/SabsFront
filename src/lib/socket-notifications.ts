import { io, Socket } from 'socket.io-client';

export function connectNotifications(jwt?: string): Socket {
  const base = (import.meta.env.VITE_API_URL as string) 
  const url = `${base.replace(/\/$/, '')}/notifications`;

  const socket = io(url, {
    auth: jwt ? { token: jwt } : undefined,
    transports: ['websocket'],
    withCredentials: true,
  });

  return socket;
}