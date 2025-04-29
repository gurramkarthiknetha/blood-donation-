import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const hospitalService = {
  submitBloodRequest: async (requestData: any) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/hospital/blood-requests`,
      requestData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  getBloodRequests: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/hospital/blood-requests`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  getBloodInventory: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/hospital/inventory`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  updateBloodInventory: async (inventoryData: any) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/hospital/inventory`,
      inventoryData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  getNotifications: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/hospital/notifications`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  markNotificationsAsRead: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/hospital/notifications/mark-read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  getInventoryHistory: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/hospital/inventory/history`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  getInventoryUsageStats: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/hospital/inventory/usage`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  recordBloodUsage: async (usageData: any) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/hospital/inventory/usage`,
      usageData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};