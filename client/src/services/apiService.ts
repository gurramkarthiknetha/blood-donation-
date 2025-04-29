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
  // details = databse(phone)
  // if(details.user === "admin") call AdminDashboard;
  // else ifdetails.user === "vendor") call vendorDashboard;
  // else ifdetails.user === "user") call userDashboard;
);

export const apiService = {
  // Blood Inventory - Static endpoints
  async getInventory() {
    return api.get('/api/hospital/inventory');
  },

  async updateInventory(data: any) {
    return api.put('/api/hospital/inventory', data);
  },

  // Blood Requests - Static endpoints
  async createBloodRequest(data: any) {
    return api.post('/api/hospital/request', data);
  },

  async getBloodRequests() {
    return api.get('/api/hospital/requests');
  },

  async updateBloodRequest(requestId: string, data: unknown) {
    return api.put(`/api/hospital/request/${requestId}`, data);
  },

  // Donor Management - Static endpoints
  async getDonors() {
    return api.get('/api/donor');
  },

  async getDonorProfile(donorId: string) {
    return api.get(`/api/donor/${donorId}`);
  },

  async updateDonorProfile(donorId: string, data: any) {
    return api.put(`/api/donor/${donorId}`, data);
  },

  // Hospital Management - Static endpoints
  async getHospitalProfile() {
    return api.get('/api/hospital/profile');
  },

  async updateHospitalProfile(data: any) {
    return api.put('/api/hospital/profile', data);
  },

  // Notifications - Static endpoints
  async getNotifications() {
    return api.get('/api/notifications');
  },

  async markNotificationsAsRead(notificationIds: string[]) {
    return api.put('/api/notifications/mark-read', { notificationIds });
  },

  // Admin Endpoints - Static endpoints
  async getAdminStats() {
    return api.get('/api/admin/dashboard/stats');
  },

  async getAllRequests() {
    return api.get('/api/admin/requests');
  },

  async approveRequest(requestId: string) {
    return api.put(`/api/admin/requests/${requestId}/approve`);
  },

  async rejectRequest(requestId: string, reason: string) {
    return api.put(`/api/admin/requests/${requestId}/reject`, { reason });
  },

  async getAllHospitals() {
    return api.get('/api/admin/hospitals');
  },

  async getAllDonors() {
    return api.get('/api/admin/donors');
  },

  // Blood Camp Events - Static endpoints
  async createDonationEvent(eventData: any) {
    return api.post('/api/events', eventData);
  },

  async getDonationEvents() {
    return api.get('/api/events');
  },

  async registerForEvent(eventId: string, bloodType: string) {
    return api.post(`/api/events/${eventId}/register`, { bloodType });
  },

  async getUserRegisteredEvents() {
    return api.get('/api/events/registered');
  },

  async cancelEventRegistration(eventId: string) {
    return api.post(`/api/events/${eventId}/cancel`);
  },

  // Rewards System - Static endpoints
  async getAvailableRewards() {
    return api.get('/api/rewards');
  },

  async getUserRewards() {
    return api.get('/api/rewards/user-rewards');
  },

  async redeemReward(rewardId: string, deliveryDetails: any) {
    return api.post(`/api/rewards/redeem/${rewardId}`, { deliveryDetails });
  },

  // Admin Reward Management - Static endpoints
  async createReward(rewardData: any) {
    return api.post('/api/rewards', rewardData);
  },

  async createBadge(badgeData: any) {
    return api.post('/api/rewards/badges', badgeData);
  }
};