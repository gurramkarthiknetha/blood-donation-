import { api } from '../config/api';

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
    const response = await api.post(`/${credentials.role}/login`, credentials);
    const { token, role, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService();