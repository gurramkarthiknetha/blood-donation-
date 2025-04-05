import api from '../config/api';

export const hospitalDashboardService = {
  getInventory: async () => {
    const response = await api.get('/hospital/inventory');
    return response.data;
  },

  updateInventory: async (data: { bloodType: string; quantity: number }) => {
    const response = await api.put('/hospital/inventory', data);
    return response.data;
  },

  createRequest: async (data: {
    bloodType: string;
    quantity: number;
    urgency: 'low' | 'medium' | 'high';
  }) => {
    const response = await api.post('/hospital/request', data);
    return response.data;
  },

  getRequests: async () => {
    const response = await api.get('/hospital/requests');
    return response.data;
  },

  getInventoryStats: async () => {
    const response = await api.get('/hospital/inventory/stats');
    return response.data;
  },

  createDonationEvent: async (data: {
    date: Date;
    location: string;
    capacity: number;
    bloodTypesNeeded: string[];
  }) => {
    const response = await api.post('/hospital/events', data);
    return response.data;
  },

  getDonationEvents: async () => {
    const response = await api.get('/hospital/events');
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/hospital/notifications');
    return response.data;
  },

  markNotificationsAsRead: async () => {
    const response = await api.put('/hospital/notifications/mark-read');
    return response.data;
  }
};