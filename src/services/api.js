import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const customerAPI = {
  // Create Customer - Assessment Requirement
  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  
  // Inquire Customer - Assessment Requirement  
  getById: async (customerId) => {
    const response = await api.get(`/customers/${customerId}`);
    return response.data;
  },
};

export default api;