const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.CLIENT_URL || 'http://localhost:5173',
          process.env.ADMIN_URL || 'http://localhost:3000'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.use((socket, next) => {
      if (socket.handshake.auth && socket.handshake.auth.token) {
        try {
          const token = socket.handshake.auth.token;
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.user = decoded;
          
          // Join role-specific room
          if (decoded.role) {
            socket.join(decoded.role);
          }
          
          // If it's a hospital, join hospital-specific room
          if (decoded.hospitalId) {
            socket.join(`hospital:${decoded.hospitalId}`);
          }
          
          next();
        } catch (err) {
          next(new Error('Authentication error'));
        }
      } else {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.connectedClients.set(socket.user.id, socket);

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.user.id);
      });
    });
  }

  notifyUser(userId, event, data) {
    const userSocket = this.connectedClients.get(userId);
    if (userSocket) {
      userSocket.emit(event, data);
    }
  }

  notifyHospital(hospitalId, event, data) {
    this.io.to(`hospital:${hospitalId}`).emit(event, data);
  }

  notifyRole(role, event, data) {
    this.io.to(role).emit(event, data);
  }

  broadcastInventoryUpdate(data) {
    this.io.emit('inventory_update', data);
  }

  notifyBloodRequest(requestData) {
    this.io.emit('blood_request', requestData);
  }
}

module.exports = new WebSocketService();