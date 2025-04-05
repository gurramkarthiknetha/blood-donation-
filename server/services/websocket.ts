import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export class WebSocketService {
  private io: Server;
  private connectedHospitals: Map<string, string> = new Map();

  constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        socket.data.hospitalId = decoded.hospitalId;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      const hospitalId = socket.data.hospitalId;
      this.connectedHospitals.set(hospitalId, socket.id);

      socket.on('disconnect', () => {
        this.connectedHospitals.delete(hospitalId);
      });
    });
  }

  public sendNotification(hospitalId: string, notification: any) {
    const socketId = this.connectedHospitals.get(hospitalId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }
}