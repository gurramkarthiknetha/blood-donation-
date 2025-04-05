import { Server } from 'socket.io';
import { wsAuthMiddleware } from '../middleware/wsAuth';
import { wsErrorHandler } from '../middleware/wsErrorHandler';
import { logger } from '../utils/logger';

export class WebSocketService {
  private io: Server;
  private connections = new Map();

  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.CLIENT_URL || 'http://localhost:5173',
          process.env.ADMIN_URL || 'http://localhost:5174',
          'http://localhost:3000'
        ],
        credentials: true
      }
    });

    this.io.use(wsAuthMiddleware);

    this.io.on('connection', (socket) => {
      try {
        const user = socket.data.user;
        this.connections.set(user.id, socket);

        // Join role-specific room
        socket.join(user.role);
        
        // Join user-specific room
        socket.join(`user:${user.id}`);

        // Apply error handling middleware
        wsErrorHandler(socket);

        socket.on('disconnect', () => {
          this.connections.delete(user.id);
          socket.leave(user.role);
          socket.leave(`user:${user.id}`);
          logger.info(`User ${user.id} disconnected`);
        });

      } catch (error) {
        logger.error('Error in socket connection:', error);
        socket.disconnect();
      }
    });
  }

  notifyUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  notifyRole(role: string, event: string, data: any) {
    this.io.to(role).emit(event, data);
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

  emitDonationStatus(userId: string, data: any) {
    this.notifyUser(userId, 'donation_status', data);
  }

  emitSlotAvailability(data: any) {
    this.io.to('donor').emit('slot_availability', data);
  }
}