import { InventoryMonitor } from './services/inventoryMonitor';
import TemperatureMonitor from './services/temperatureMonitor';
import ReportScheduler from './services/reportScheduler';
import ConnectionManager from './services/connectionManager';
import MetricsDashboard from './services/metricsDashboard';

export const initializeServices = async () => {
  // Initialize database connection
  const connectionManager = ConnectionManager.getInstance();
  await connectionManager.connect(process.env.MONGODB_URI || '');

  // Start the monitoring services after database connection
  if (connectionManager.getConnectionStatus()) {
    // Start the inventory monitoring service
    const inventoryMonitor = InventoryMonitor.getInstance();
    inventoryMonitor.startMonitoring();

    // Start the temperature monitoring service
    const temperatureMonitor = TemperatureMonitor.getInstance();
    temperatureMonitor.startMonitoring();

    // Initialize report scheduler
    const reportScheduler = ReportScheduler.getInstance();

    // Start metrics dashboard monitoring
    const metricsDashboard = MetricsDashboard.getInstance();
    metricsDashboard.startMonitoring();

    // Monitor connection pool health
    setInterval(() => {
      const activeConnections = connectionManager.getActiveConnections();
      console.log(`Active database connections: ${activeConnections}`);
    }, 300000); // Check every 5 minutes
  }

  // Add shutdown handler
  process.on('SIGTERM', async () => {
    console.log('Shutting down services...');
    const inventoryMonitor = InventoryMonitor.getInstance();
    const temperatureMonitor = TemperatureMonitor.getInstance();
    const metricsDashboard = MetricsDashboard.getInstance();
    
    inventoryMonitor.stopMonitoring();
    temperatureMonitor.stopMonitoring();
    metricsDashboard.stopMonitoring();
    
    // Close database connection
    await connectionManager.disconnect();
  });
};