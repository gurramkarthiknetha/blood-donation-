import axios from 'axios';
import { api } from '../config/api';

const API_URL = 'http://localhost:5001/api';

interface LoginCredentials {
  email: string;
  password: string;
  role: string;
}

class AuthService {
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getUserRole() {
    return localStorage.getItem('userRole');
  }

  async login(credentials: LoginCredentials) {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const { token, role, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Login failed' };
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return null;
    }
  }

  async registerDonor(data: unknown) {
    return api.post('/donor/register', data);
  }

  async registerHospital(data: unknown) {
    return api.post('/hospital/register', data);
  }

  async register(userData: any) {
    try {
      const response = await axios.post(`${API_URL}/register`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService();
export default authService;