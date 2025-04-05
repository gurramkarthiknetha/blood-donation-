import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Add request interceptor to include auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminAPI = {
  // Auth
  register: async (data: { username: string; email: string; password: string; role: string }) => {
    const response = await axios.post(`${API_URL}/admin/create`, data);
    return response.data;
  },

  login: async (credentials: { username: string; password: string }) => {
    const response = await axios.post(`${API_URL}/admin/login`, credentials);
    return response.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await axios.get(`${API_URL}/admin/dashboard/stats`);
    return response.data;
  },

  getHospitalStats: async () => {
    const response = await axios.get(`${API_URL}/admin/dashboard/hospitals`);
    return response.data;
  },

  getDonorStats: async () => {
    const response = await axios.get(`${API_URL}/admin/dashboard/donors`);
    return response.data;
  },

  // Blood Requests
  getAllRequests: async () => {
    const response = await axios.get(`${API_URL}/admin/requests`);
    return response.data;
  },

  approveRequest: async (requestId: string, hospitalId: string) => {
    const response = await axios.put(`${API_URL}/admin/requests/${requestId}/approve`, { hospitalId });
    return response.data;
  },

  rejectRequest: async (requestId: string, hospitalId: string, reason: string) => {
    const response = await axios.put(`${API_URL}/admin/requests/${requestId}/reject`, { 
      hospitalId,
      reason 
    });
    return response.data;
  },

  // Hospital Management
  getHospitals: async () => {
    const response = await axios.get(`${API_URL}/admin/hospitals`);
    return response.data;
  },

  manageHospital: async (hospitalId: string, updates: never) => {
    const response = await axios.put(`${API_URL}/admin/hospitals/${hospitalId}`, updates);
    return response.data;
  },
  
  // Donor Management
  getDonors: async () => {
    const response = await axios.get(`${API_URL}/admin/donors`);
    return response.data;
  },

  manageDonor: async (donorId: string, updates: never) => {
    const response = await axios.put(`${API_URL}/admin/donors/${donorId}`, updates);
    return response.data;
  }
};