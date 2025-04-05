import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

export class WebSocketService {
  private io: Server;

  constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.CLIENT_URL || 'http://localhost:5173',
          process.env.ADMIN_URL || 'http://localhost:5174'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket) => {
      console.log('a user connected');

      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });
  }
}