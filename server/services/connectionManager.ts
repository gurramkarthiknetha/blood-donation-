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

  async connect(uri: string): Promise<void> {
    if (this.isConnected) return;

    try {
      await mongoose.connect(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        keepAlive: true,
        keepAliveInitialDelay: 300000
      });

      mongoose.connection.on('connected', () => {
        this.isConnected = true;
        this.retryCount = 0;
        console.log('Database connection established');
      });

      mongoose.connection.on('error', (error) => {
        console.error('Database connection error:', error);
        this.handleConnectionError();
      });

      mongoose.connection.on('disconnected', () => {
        console.log('Database disconnected');
        this.handleConnectionError();
      });

    } catch (error) {
      console.error('Error connecting to database:', error);
      this.handleConnectionError();
    }
  }

  private handleConnectionError(): void {
    this.isConnected = false;

    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);

      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
      }

      this.retryTimeout = setTimeout(() => {
        console.log(`Retrying connection (attempt ${this.retryCount})`);
        this.connect(process.env.MONGODB_URI || '');
      }, delay);
    } else {
      console.error('Max connection retries reached');
      process.exit(1);
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
    return mongoose.connection.ActiveConnectionsCount || 0;
  }
}

export default ConnectionManager;