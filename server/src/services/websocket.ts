import { Server } from 'socket.io';
import { verifyToken } from '../utils/auth';

export class WebSocketService {
  private io: Server;
  private connections = new Map();

  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true
      }
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }
        const user = await verifyToken(token);
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      const userId = socket.data.user.id;
      this.connections.set(userId, socket);

      socket.on('disconnect', () => {
        this.connections.delete(userId);
      });
    });
  }

  notifyUser(userId: string, event: string, data: any) {
    const socket = this.connections.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  notifyAdmin(event: string, data: any) {
    this.io.to('admin').emit(event, data);
  }

  broadcastInventoryUpdate(data: any) {
    this.io.emit('inventory_update', data);
  }

  notifyBloodRequest(data: any) {
    this.io.emit('blood_request', data);
  }
}