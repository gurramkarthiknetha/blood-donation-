import api from '../config/api';

export const donorDashboardService = {
  getDonorProfile: async () => {
    const response = await api.get('/donor/profile');
    return response.data;
  },

  getDonationHistory: async () => {
    const response = await api.get('/donor/donations');
    return response.data;
  },

  getAvailableCamps: async () => {
    const response = await api.get('/donor/events');
    return response.data;
  },

  registerForCamp: async (campId: string) => {
    const response = await api.post(`/donor/events/${campId}/register`);
    return response.data;
  },

  getEligibilityStatus: async () => {
    const response = await api.get('/donor/eligibility');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/donor/profile', data);
    return response.data;
  }
};