import { io, Socket } from 'socket.io-client';
import { authService } from './authService';
import { toastService } from './toastService';

class WebSocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private isConnecting = false;

  connect() {
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;
    const token = authService.getToken();

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      auth: { token },
      withCredentials: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000
    });

    this.setupConnectionHandlers();
    this.setupEventListeners();
  }

  private setupConnectionHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toastService.error('Failed to connect to the server. Please refresh the page.');
        this.disconnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket:', reason);
      this.isConnecting = false;

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, attempt reconnect
        setTimeout(() => this.connect(), this.reconnectDelay);
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('inventory_update', (data) => {
      this.triggerHandlers('inventory_update', data);
    });

    this.socket.on('blood_request', (data) => {
      this.triggerHandlers('blood_request', data);
    });

    this.socket.on('notification', (data) => {
      this.triggerHandlers('notification', data);
    });

    this.socket.on('donation_status', (data) => {
      this.triggerHandlers('donation_status', data);
    });

    this.socket.on('slot_availability', (data) => {
      this.triggerHandlers('slot_availability', data);
    });
  }

  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private triggerHandlers(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();