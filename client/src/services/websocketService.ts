import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private notificationCallbacks: ((notification: any) => void)[] = [];

  connect() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:4000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('notification', (notification) => {
      this.notificationCallbacks.forEach(callback => callback(notification));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback: (notification: any) => void) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }
}

export const wsService = new WebSocketService();