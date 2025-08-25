// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging and debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('📤 Request Data:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Setup Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - Status: ${response.status}`);
    console.log('📥 Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    // Enhanced error messages for user-friendly display
    if (error.response) {
      switch (error.response.status) {
        case 404:
          error.userMessage = 'Resource not found';
          break;
        case 400:
          error.userMessage = error.response.data?.message || 'Invalid request data';
          break;
        case 500:
          error.userMessage = 'Server error. Please try again later.';
          break;
        case 409:
          error.userMessage = 'Conflict - Resource already exists';
          break;
        default:
          error.userMessage = 'An unexpected error occurred';
      }
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      error.userMessage = 'Cannot connect to server. Please ensure the backend is running on port 8080.';
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Request timeout. Please try again.';
    } else {
      error.userMessage = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// ========================================
// CUSTOMER API SERVICES
// Assessment Requirements 1 & 2
// ========================================
export const customerAPI = {
  /**
   * CREATE CUSTOMER - Assessment Requirement 1
   * "Create customer: Accepts customer details such as name, and assigns an automatically generated ID."
   */
  createCustomer: async (customerData) => {
    try {
      const response = await api.post('/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  /**
   * INQUIRE CUSTOMER - Assessment Requirement 2
   * "Inquire customer: Returns customer details based on the provided customer ID."
   */
  getCustomerById: async (customerId) => {
    try {
      const response = await api.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  },

  // Additional customer management endpoints
  getAllCustomers: async () => {
    try {
      const response = await api.get('/customers');
      return response.data;
    } catch (error) {
      console.error('Error fetching all customers:', error);
      throw error;
    }
  },

  searchCustomersByName: async (searchTerm) => {
    try {
      const response = await api.get(`/customers/search?name=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  },

  getCustomerCount: async () => {
    try {
      const response = await api.get('/customers/count');
      return response.data;
    } catch (error) {
      console.error('Error getting customer count:', error);
      throw error;
    }
  }
};

// ========================================
// ACCOUNT API SERVICES  
// Assessment Requirements 3, 6 & 7
// ========================================
export const accountAPI = {
  /**
   * CREATE ACCOUNT - Assessment Requirement 3
   * "Create Account: Accepts account type, and creates an account with an auto-generated number. 
   *  Account status should be set as "Active"."
   */
  createAccount: async (accountData) => {
    try {
      const response = await api.post('/accounts', accountData);
      return response.data;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  /**
   * INQUIRE ACCOUNT - Assessment Requirement 7
   * "Inquire Account: Accepts account number and returns the details of the account holder 
   *  and the account status."
   */
  getAccountByNumber: async (accountNumber) => {
    try {
      const response = await api.get(`/accounts/${accountNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  },

  /**
   * CLOSE ACCOUNT - Assessment Requirement 6
   * "Close Account: Accepts account number and updates the status to "Closed"."
   */
  closeAccount: async (accountNumber) => {
    try {
      const response = await api.put(`/accounts/${accountNumber}/close`);
      return response.data;
    } catch (error) {
      console.error('Error closing account:', error);
      throw error;
    }
  },

  // Additional account endpoints
  getAccountsByCustomer: async (customerId) => {
    try {
      const response = await api.get(`/accounts/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer accounts:', error);
      throw error;
    }
  },

  getAllAccounts: async () => {
    try {
      const response = await api.get('/accounts');
      return response.data;
    } catch (error) {
      console.error('Error fetching all accounts:', error);
      throw error;
    }
  }
};

// ========================================
// TRANSACTION API SERVICES
// Assessment Requirements 4 & 5
// ========================================
export const transactionAPI = {
  /**
   * DEPOSIT CASH - Assessment Requirement 4
   * "Deposit Cash: Accepts account number and deposit amount, and updates the balance."
   */
  depositCash: async (transactionData) => {
    try {
      const response = await api.post('/transactions/deposit', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error processing deposit:', error);
      throw error;
    }
  },

  /**
   * WITHDRAW CASH - Assessment Requirement 5
   * "Withdraw Cash: Accepts account number and withdrawal amount, and updates the balance."
   */
  withdrawCash: async (transactionData) => {
    try {
      const response = await api.post('/transactions/withdraw', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      throw error;
    }
  },

  // Additional transaction endpoints
  getTransactionHistory: async (accountNumber) => {
    try {
      const response = await api.get(`/transactions/account/${accountNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  },

  getAllTransactions: async () => {
    try {
      const response = await api.get('/transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  },

  getRecentTransactions: async (limit = 10) => {
    try {
      const response = await api.get(`/transactions/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Test server connectivity
 */
export const checkServerConnection = async () => {
  try {
    const response = await api.get('/customers/count');
    return { 
      connected: true, 
      message: 'Server connected successfully',
      customerCount: response.data 
    };
  } catch (error) {
    return { 
      connected: false, 
      message: error.userMessage || 'Server connection failed',
      error: error.message
    };
  }
};

/**
 * Validate account number format
 */
export const validateAccountNumber = (accountNumber) => {
  const accountPattern = /^ACC\d{13}$/;
  return accountPattern.test(accountNumber);
};

/**
 * Format currency display
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Export the configured axios instance for custom requests
export default api;