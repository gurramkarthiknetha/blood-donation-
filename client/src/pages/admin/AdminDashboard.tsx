import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { toastService } from '../../services/toastService';
import './AdminDashboard.css';
import { useWebSocket } from '../../hooks/useWebSocket';
import { wsService } from '../../services/websocketService';

interface BloodInventory {
  bloodType: string;
  units: number;
}

interface BloodRequest {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: string;
  quantity: number;
  status: string;
  urgency: string;
  createdAt: string;
}

function AdminDashboard() {
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateData, setUpdateData] = useState({
    bloodType: '',
    units: 0
  });
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalHospitals: 0,
    pendingRequests: 0,
    lowInventoryItems: 0
  });
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    // Connect to WebSocket when component mounts
    wsService.connect();

    // Load initial data
    loadDashboardData();

    // Cleanup WebSocket connection when component unmounts
    return () => {
      wsService.disconnect();
    };
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
      const response = await apiService.getInventory();
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
      await apiService.updateInventory(updateData);
      toastService.success('Inventory updated successfully');
      fetchInventory();
      setUpdateData({ bloodType: '', units: 0 });
    } catch (error) {
      toastService.error('Failed to update inventory');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await apiService.approveRequest(requestId);
      toastService.success('Request approved successfully');
      loadDashboardData();
    } catch (error) {
      toastService.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await apiService.rejectRequest(requestId, 'Rejected by admin');
      toastService.success('Request rejected successfully');
      loadDashboardData();
    } catch (error) {
      toastService.error('Failed to reject request');
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
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Blood Inventory
          </button>
          <button
            className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Blood Requests
          </button>
          <button
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Donors</h3>
          <p>{stats.totalDonors}</p>
        </div>
        <div className="stat-card">
          <h3>Total Hospitals</h3>
          <p>{stats.totalHospitals}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p>{stats.pendingRequests}</p>
        </div>
        <div className="stat-card">
          <h3>Low Inventory</h3>
          <p>{stats.lowInventoryItems}</p>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div className="inventory-section">
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
      )}

      {activeTab === 'requests' && (
        <div className="requests-section">
          <h2>Blood Requests</h2>

          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Blood Type</th>
                  <th>Quantity</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <tr key={request._id}>
                      <td>{request.hospitalName}</td>
                      <td>{request.bloodType}</td>
                      <td>{request.quantity}</td>
                      <td>{request.urgency}</td>
                      <td>{request.status}</td>
                      <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td>
                        {request.status === 'pending' && (
                          <div className="action-buttons">
                            <button
                              className="approve-btn"
                              onClick={() => handleApproveRequest(request._id)}
                            >
                              Approve
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() => handleRejectRequest(request._id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>No requests found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="stats-section">
          <h2>Blood Donation Statistics</h2>

          <div className="stats-charts">
            <div className="chart">
              <h3>Blood Type Distribution</h3>
              <div className="placeholder-chart">
                {/* This would be replaced with an actual chart component */}
                <p>Chart visualization will be displayed here</p>
              </div>
            </div>

            <div className="chart">
              <h3>Monthly Donations</h3>
              <div className="placeholder-chart">
                {/* This would be replaced with an actual chart component */}
                <p>Chart visualization will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;