import axios from 'axios';
import useAuthStore from '../store/useAuthStore';


// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from auth store
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          useAuthStore.getState().logout();
          window.location.href = '/auth/login';
          break;
        case 403:
          console.error('Access forbidden:', data.message || 'Forbidden');
          break;
        case 404:
          console.error('Resource not found:', data.message || 'Not found');
          break;
        case 500:
          console.error('Server error:', data.message || 'Internal server error');
          break;
        default:
          console.error('API Error:', data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

