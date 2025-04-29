import axios from 'axios';

const baseURL = 'http://localhost:5001';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 5000
});

const sleep = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

export const adminAPI = {
  // Authentication - Static endpoint
  login: async (credentials: any) => {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await api.post('/admin/login', credentials);
        return response.data;
      } catch (error) {
        if (error.code === 'ERR_CONNECTION_RESET' && retries < MAX_RETRIES - 1) {
          retries++;
          await sleep(RETRY_DELAY * retries);
          continue;
        }
        throw error;
      }
    }
  },

  // Dashboard Statistics - Static endpoint
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Blood Requests Management - Static endpoints
  getRequests: async () => {
    const response = await api.get('/admin/requests');
    return response.data;
  },

  getAllRequests: async () => {
    const response = await api.get('/admin/requests');
    return response.data;
  },

  approveRequest: async (requestId: any, hospitalId?: any) => {
    const response = await api.put(`/admin/requests/${requestId}/approve`);
    return response.data;
  },

  rejectRequest: async (requestId: any, hospitalId?: any, reason?: any) => {
    const response = await api.put(`/admin/requests/${requestId}/reject`, { reason });
    return response.data;
  },

  // Inventory Management - Static endpoint
  updateInventory: async (inventoryData: any) => {
    const response = await api.put('/admin/inventory', inventoryData);
    return response.data;
  },

  // Hospital Management - Static endpoint
  getHospitals: async () => {
    const response = await api.get('/admin/hospitals');
    return response.data;
  },

  // Donor Management - Static endpoint
  getDonors: async () => {
    const response = await api.get('/admin/donors');
    return response.data;
  }
};