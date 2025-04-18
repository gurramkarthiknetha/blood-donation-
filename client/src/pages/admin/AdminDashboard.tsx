import { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosConfig';
import { toastService } from '../../services/toastService';
import './AdminDashboard.css';
import { useWebSocket } from '../../hooks/useWebSocket';

interface BloodInventory {
  bloodType: string;
  units: number;
}

function AdminDashboard() {
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateData, setUpdateData] = useState({
    bloodType: '',
    units: 0
  });
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalHospitals: 0,
    pendingRequests: 0,
    lowInventoryItems: 0
  });

  useEffect(() => {
    fetchInventory();
    loadDashboardData();
  }, []);

  useWebSocket('inventory_update', (data) => {
    setInventory(data);
    updateStats();
  });

  useWebSocket('blood_request', (data) => {
    setRequests(prev => [data, ...prev]);
    updateStats();
  });

  const fetchInventory = async () => {
    try {
      const response = await axiosInstance.get('/admin/inventory');
      setInventory(response.data);
    } catch (error) {
      toastService.error('Failed to fetch inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/admin/inventory/update', updateData);
      toastService.success('Inventory updated successfully');
      fetchInventory();
      setUpdateData({ bloodType: '', units: 0 });
    } catch (error) {
      toastService.error('Failed to update inventory');
    }
  };

  const loadDashboardData = async () => {
    try {
      const [inventoryRes, requestsRes, statsRes] = await Promise.all([
        apiService.getInventory(),
        apiService.getAllRequests(),
        apiService.getAdminStats()
      ]);
      
      setInventory(inventoryRes.data);
      setRequests(requestsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toastService.error('Failed to load dashboard data');
    }
  };

  const updateStats = async () => {
    try {
      const response = await apiService.getAdminStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Blood Inventory Management</h2>
      
      <div className="inventory-grid">
        {inventory.map((item) => (
          <div key={item.bloodType} className="inventory-card">
            <h3>{item.bloodType}</h3>
            <p>{item.units} units</p>
          </div>
        ))}
      </div>

      <div className="update-form">
        <h3>Update Inventory</h3>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Blood Type</label>
            <select
              value={updateData.bloodType}
              onChange={(e) => setUpdateData({...updateData, bloodType: e.target.value})}
              required
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="form-group">
            <label>Units</label>
            <input
              type="number"
              value={updateData.units}
              onChange={(e) => setUpdateData({...updateData, units: parseInt(e.target.value)})}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Update Inventory
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;