import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log(`🚀 Making ${config.method?.toUpperCase()} request to ${config.url}`);
  console.log('Request config:', config);
  return config;
});

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      request: error.request
    });
    return Promise.reject(error);
  }
);

export const customerAPI = {
  // Create Customer - Assessment Requirement
  create: async (customerData) => {
    try {
      console.log('📤 Sending customer data:', customerData);
      const response = await api.post('/customers', customerData);
      console.log('📥 Received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 Customer creation failed:', error);
      throw error;
    }
  },
  
  // Inquire Customer - Assessment Requirement  
  getById: async (customerId) => {
    try {
      console.log('🔍 Fetching customer ID:', customerId);
      const response = await api.get(`/customers/${customerId}`);
      console.log('📥 Received customer:', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 Customer fetch failed:', error);
      throw error;
    }
  },
};

export default api;