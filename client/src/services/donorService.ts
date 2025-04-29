import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const donorService = {
  getAvailableEvents: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/donor/events`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  registerForEvent: async (eventId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/donor/events/${eventId}/register`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  getRegisteredEvents: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/donor/events/registered`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};