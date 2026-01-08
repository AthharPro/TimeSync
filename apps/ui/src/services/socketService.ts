import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4004';

let socket: Socket | null = null;

/**
 * Initialize Socket.io connection and join user's notification room
 */
export const initializeSocket = (userId: string): Socket => {
  // If already connected to same user, return existing socket
  if (socket?.connected) {
    // Ensure we're in the correct room (in case userId changed)
    socket.emit('join', userId);
    return socket;
  }

  // Disconnect existing socket if any (for user switching)
  if (socket && !socket.connected) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    // Join user's personal notification room
    socket!.emit('join', userId);
  });

  socket.on('disconnect', (reason) => {
  });

  socket.on('connect_error', (error) => {
  });

  socket.on('reconnect', (attemptNumber) => {
    // Re-join the room after reconnection
    socket!.emit('join', userId);
  });

  socket.on('reconnect_failed', () => {
  });

  return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Disconnect socket connection
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};
