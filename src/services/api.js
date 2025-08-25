import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
  withCredentials: false, // Important for CORS
});

// Enhanced request interceptor with detailed logging
api.interceptors.request.use(
  (config) => {
    const timestamp = new Date().toISOString();
    console.group(`🚀 API REQUEST [${timestamp}]`);
    console.log('Method:', config.method?.toUpperCase());
    console.log('URL:', config.url);
    console.log('Full URL:', config.baseURL + config.url);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    console.log('Timeout:', config.timeout);
    console.groupEnd();
    
    return config;
  },
  (error) => {
    console.error('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with detailed error analysis
api.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    console.group(`✅ API SUCCESS RESPONSE [${timestamp}]`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    console.groupEnd();
    
    return response;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    console.group(`❌ API ERROR RESPONSE [${timestamp}]`);
    
    if (error.response) {
      // Server responded with error status
      console.log('🔴 SERVER ERROR RESPONSE');
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
      console.log('Config:', error.config);
    } else if (error.request) {
      // Request was made but no response received (NETWORK ERROR)
      console.log('🔴 NETWORK ERROR - No response received');
      console.log('Request:', error.request);
      console.log('Message:', error.message);
      console.log('Code:', error.code);
      console.log('Config:', error.config);
      
      // Additional network debugging
      if (error.code === 'ECONNREFUSED') {
        console.log('🚨 CONNECTION REFUSED: Backend server is not running on port 8080');
        console.log('📋 SOLUTION: Start Spring Boot backend with: mvn spring-boot:run');
      } else if (error.code === 'ENOTFOUND') {
        console.log('🚨 HOST NOT FOUND: DNS resolution failed');
        console.log('📋 SOLUTION: Check if localhost resolves correctly');
      } else if (error.message.includes('CORS')) {
        console.log('🚨 CORS ERROR: Cross-origin request blocked');
        console.log('📋 SOLUTION: Check CORS configuration in Spring Boot backend');
      } else if (error.code === 'ECONNABORTED') {
        console.log('🚨 TIMEOUT ERROR: Request took longer than 15 seconds');
        console.log('📋 SOLUTION: Check backend performance or increase timeout');
      }
    } else {
      // Something else happened
      console.log('🔴 UNKNOWN ERROR');
      console.log('Message:', error.message);
      console.log('Stack:', error.stack);
    }
    
    console.groupEnd();
    return Promise.reject(error);
  }
);

// Test backend connectivity
const testBackendConnectivity = async () => {
  try {
    console.log('🔍 Testing backend connectivity...');
    const response = await axios.get('http://localhost:8080/actuator/health', {
      timeout: 5000
    });
    console.log('✅ Backend is reachable:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend connectivity test failed:', error.message);
    return false;
  }
};

// Enhanced customer API with better error handling
export const customerAPI = {
  // Test backend connectivity
  testConnection: testBackendConnectivity,
  
  // Create Customer - Assessment Requirement
  create: async (customerData) => {
    try {
      console.log('📤 Creating customer with data:', customerData);
      
      // Test connectivity first
      const isBackendUp = await testBackendConnectivity();
      if (!isBackendUp) {
        throw new Error('Backend server is not reachable. Please ensure Spring Boot application is running on port 8080.');
      }
      
      const response = await api.post('/customers', customerData);
      console.log('✅ Customer created successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('💥 Customer creation failed');
      
      // Enhanced error messages for user
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        error.userMessage = 'Cannot connect to server. Please ensure the backend is running.';
      } else if (error.response?.status === 400) {
        error.userMessage = error.response.data?.message || 'Invalid customer data provided.';
      } else if (error.response?.status === 409) {
        error.userMessage = 'Customer with this email already exists.';
      } else if (error.response?.status === 500) {
        error.userMessage = 'Server error occurred. Please try again later.';
      } else {
        error.userMessage = error.message || 'An unexpected error occurred.';
      }
      
      throw error;
    }
  },
  
  // Inquire Customer - Assessment Requirement  
  getById: async (customerId) => {
    try {
      console.log('🔍 Fetching customer with ID:', customerId);
      
      // Validate customer ID
      if (!customerId || customerId <= 0) {
        throw new Error('Valid customer ID is required');
      }
      
      const response = await api.get(`/customers/${customerId}`);
      console.log('✅ Customer retrieved successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('💥 Customer retrieval failed');
      
      // Enhanced error messages for user
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        error.userMessage = 'Cannot connect to server. Please ensure the backend is running.';
      } else if (error.response?.status === 404) {
        error.userMessage = `Customer with ID ${customerId} not found.`;
      } else if (error.response?.status === 400) {
        error.userMessage = 'Invalid customer ID provided.';
      } else if (error.response?.status === 500) {
        error.userMessage = 'Server error occurred. Please try again later.';
      } else {
        error.userMessage = error.message || 'An unexpected error occurred.';
      }
      
      throw error;
    }
  },
  
  // Get all customers (for debugging)
  getAll: async () => {
    try {
      console.log('📋 Fetching all customers...');
      const response = await api.get('/customers');
      console.log('✅ All customers retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 Failed to fetch all customers:', error);
      throw error;
    }
  }
};

// Export utilities for debugging
export const debugUtils = {
  testConnection: testBackendConnectivity,
  
  // Test all API endpoints
  testAllEndpoints: async () => {
    console.log('🧪 Testing all API endpoints...');
    
    const results = {
      health: false,
      customers: false,
      customerById: false
    };
    
    try {
      // Test health endpoint
      await axios.get('http://localhost:8080/actuator/health');
      results.health = true;
      console.log('✅ Health endpoint: OK');
    } catch (error) {
      console.log('❌ Health endpoint: FAILED', error.message);
    }
    
    try {
      // Test customers endpoint
      await api.get('/customers');
      results.customers = true;
      console.log('✅ Customers endpoint: OK');
    } catch (error) {
      console.log('❌ Customers endpoint: FAILED', error.message);
    }
    
    try {
      // Test specific customer endpoint
      await api.get('/customers/1');
      results.customerById = true;
      console.log('✅ Customer by ID endpoint: OK');
    } catch (error) {
      console.log('❌ Customer by ID endpoint: FAILED', error.message);
    }
    
    return results;
  }
};

export default api;