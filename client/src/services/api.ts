import axios from 'axios';
import { io } from 'socket.io-client';

const baseURL = 'http://localhost:5001/api';
const wsURL = 'ws://localhost:5001';

export const socket = io(wsURL, {
  autoConnect: false
});

const api = axios.create({
  baseURL,
  withCredentials: true
});

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

export const donorService = {
  donate: async (donationData) => {
    const response = await api.post('/donor/donate', donationData);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/donor/history');
    return response.data;
  }
};

export const hospitalService = {
  requestBlood: async (requestData) => {
    const response = await api.post('/hospital/request', requestData);
    return response.data;
  },

  getInventory: async () => {
    const response = await api.get('/hospital/inventory');
    return response.data;
  }
};