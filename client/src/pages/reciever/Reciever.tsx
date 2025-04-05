import { useState, useEffect } from 'react';
import { hospitalDashboardService } from '../../services/hospitalDashboardService';
import { wsService } from '../../services/websocketService';
import { toastService } from '../../services/toastService';
import BloodRequestForm from './BloodRequestForm';
import InventoryTable from './InventoryTable';
import RequestHistory from './RequestHistory';
import './Reciever.css';

interface BloodRequest {
  id: string;
  bloodType: string;
  quantity: number;
  status: string;
  createdAt: string;
}

interface InventoryItem {
  bloodType: string;
  quantity: number;
  lastUpdated: string;
}

const Reciever = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    unitsInStock: 0
  });

  useEffect(() => {
    loadDashboardData();
    setupWebSocket();
    return () => wsService.disconnect();
  }, []);

  const setupWebSocket = () => {
    wsService.connect();
    wsService.subscribe('inventory_update', handleInventoryUpdate);
    wsService.subscribe('request_status', handleRequestUpdate);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [inventoryData, requestsData, statsData] = await Promise.all([
        hospitalDashboardService.getInventory(),
        hospitalDashboardService.getRequests(),
        hospitalDashboardService.getInventoryStats()
      ]);

      setInventory(inventoryData);
      setRequests(requestsData);
      setStats(statsData);
    } catch (error: any) {
      toastService.error(error.response?.data?.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryUpdate = (update: any) => {
    setInventory(prev => {
      const index = prev.findIndex(item => item.bloodType === update.bloodType);
      if (index === -1) return [...prev, update];
      const newInventory = [...prev];
      newInventory[index] = { ...newInventory[index], ...update };
      return newInventory;
    });
    toastService.info(`Inventory updated for ${update.bloodType}`);
  };

  const handleRequestUpdate = (update: any) => {
    setRequests(prev => {
      const index = prev.findIndex(req => req.id === update.id);
      if (index === -1) return prev;
      const newRequests = [...prev];
      newRequests[index] = { ...newRequests[index], ...update };
      return newRequests;
    });
    toastService.info(`Request ${update.id} status updated to ${update.status}`);
  };

  const handleNewRequest = async (data: { bloodType: string; quantity: number; urgency: string }) => {
    try {
      await hospitalDashboardService.createRequest(data);
      toastService.success('Blood request created successfully');
      loadDashboardData();
    } catch (error: any) {
      toastService.error(error.response?.data?.message || 'Error creating request');
    }
  };

  if (loading) {
    return (
      <div className="hospital-dashboard loading">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="hospital-dashboard">
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p>{stats.totalRequests}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p>{stats.pendingRequests}</p>
        </div>
        <div className="stat-card">
          <h3>Units in Stock</h3>
          <p>{stats.unitsInStock}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="row">
          <div className="col-md-6">
            <BloodRequestForm onSubmit={handleNewRequest} />
            <InventoryTable inventory={inventory} />
          </div>
          <div className="col-md-6">
            <RequestHistory requests={requests} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reciever;