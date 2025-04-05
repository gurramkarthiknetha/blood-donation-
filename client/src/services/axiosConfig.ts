import axios from 'axios';
import { authService } from './authService';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/signinPage';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;