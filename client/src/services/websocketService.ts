import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private subscribers: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('token');
    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';

    this.socket = io(WS_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('notification', (data) => {
      this.notifySubscribers('notification', data);
    });

    this.socket.on('blood_request', (data) => {
      this.notifySubscribers('blood_request', data);
    });

    this.socket.on('inventory_update', (data) => {
      this.notifySubscribers('inventory_update', data);
    });
  }

  subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)?.push(callback);

    return () => this.unsubscribe(event, callback);
  }

  private unsubscribe(event: string, callback: Function) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifySubscribers(event: string, data: any) {
    const callbacks = this.subscribers.get(event);
    callbacks?.forEach(callback => callback(data));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.subscribers.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();