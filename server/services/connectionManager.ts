import mongoose from 'mongoose';

class ConnectionManager {
  private static instance: ConnectionManager;
  private isConnected: boolean = false;
  private retryTimeout: NodeJS.Timeout | null = null;
  private readonly maxRetries: number = 5;
  private retryCount: number = 0;

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-donation';
      
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      });

      this.isConnected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  setPoolSize(size: number): void {
    if (size < 1) throw new Error('Pool size must be at least 1');
    mongoose.connection.config.maxPoolSize = size;
  }

  getActiveConnections(): number {
    if (!mongoose.connection.readyState) return 0;
    // readyState 1 means connected
    return mongoose.connection.readyState === 1 ? 1 : 0;
  }
}

export default ConnectionManager;