import axios from 'axios';
import { API_URL } from '../config/api';

interface LoginData {
  email: string;
  password: string;
  role?: string;
}

export const authService = {
  async login(data: LoginData) {
    const endpoint = `${API_URL}/auth/${data.role}/login`;
    const response = await axios.post(endpoint, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    delete axios.defaults.headers.common['Authorization'];
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUserRole() {
    return localStorage.getItem('userRole');
  },

  getUserData() {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  },

  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  setupAxiosInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
};