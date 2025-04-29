import axios from 'axios';
import { authService } from './authService';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Blood Inventory
  async getInventory() {
    return api.get('/api/hospital/inventory');
  },

  async updateInventory(data: any) {
    return api.put('/api/hospital/inventory', data);
  },

  // Blood Requests
  async createBloodRequest(data: any) {
    return api.post('/api/hospital/request', data);
  },

  async getBloodRequests() {
    return api.get('/api/hospital/requests');
  },

  async updateBloodRequest(requestId: string, data: any) {
    return api.put(`/api/hospital/request/${requestId}`, data);
  },

  // Donor Management
  async getDonors() {
    return api.get('/api/donor');
  },

  async getDonorProfile(donorId: string) {
    return api.get(`/api/donor/${donorId}`);
  },

  async updateDonorProfile(donorId: string, data: any) {
    return api.put(`/api/donor/${donorId}`, data);
  },

  // Hospital Management
  async getHospitalProfile() {
    return api.get('/api/hospital/profile');
  },

  async updateHospitalProfile(data: any) {
    return api.put('/api/hospital/profile', data);
  },

  // Notifications
  async getNotifications() {
    return api.get('/api/notifications');
  },

  async markNotificationsAsRead(notificationIds: string[]) {
    return api.put('/api/notifications/mark-read', { notificationIds });
  }
};