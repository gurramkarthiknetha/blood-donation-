import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export const authService = {
  async loginDonor(credentials: LoginCredentials) {
    const response = await axios.post(`${API_URL}/donor/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('donor_token', response.data.token);
    }
    return response.data;
  },

  async loginHospital(credentials: LoginCredentials) {
    const response = await axios.post(`${API_URL}/hospital/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('hospital_token', response.data.token);
    }
    return response.data;
  },

  async loginAdmin(credentials: LoginCredentials) {
    const response = await axios.post(`${API_URL}/admin/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
    }
    return response.data;
  },

  logout(role: 'donor' | 'hospital' | 'admin') {
    localStorage.removeItem(`${role}_token`);
  }
};