import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

class SocketService {
  private io: SocketIOServer | null = null;

  init(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io not initialized');
    }
    return this.io;
  }
}

export const socketService = new SocketService();
