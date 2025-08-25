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
      // Ensure the data matches your backend DTO structure
      const requestData = {
        accountNumber: transactionData.accountNumber,
        amount: transactionData.amount,
        description: transactionData.description || 'Cash deposit'
      };
      
      const response = await api.post('/transactions/deposit', requestData);
      
      // Log successful transaction
      console.log('Deposit successful:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error processing deposit:', error);
      
      // Enhanced error handling for better user experience
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `Deposit failed: ${error.response.statusText}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request made but no response
        throw new Error('Unable to connect to server. Please check your connection and try again.');
      } else {
        // Something else happened
        throw new Error('An unexpected error occurred during deposit processing.');
      }
    }
  },

  /**
   * WITHDRAW CASH - Assessment Requirement 5
   * "Withdraw Cash: Accepts account number and withdrawal amount, and updates the balance."
   */
  withdrawCash: async (transactionData) => {
    try {
      // Ensure the data matches your backend DTO structure
      const requestData = {
        accountNumber: transactionData.accountNumber,
        amount: transactionData.amount,
        description: transactionData.description || 'Cash withdrawal'
      };
      
      const response = await api.post('/transactions/withdraw', requestData);
      
      // Log successful transaction
      console.log('Withdrawal successful:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      
      // Enhanced error handling for better user experience
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `Withdrawal failed: ${error.response.statusText}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request made but no response
        throw new Error('Unable to connect to server. Please check your connection and try again.');
      } else {
        // Something else happened
        throw new Error('An unexpected error occurred during withdrawal processing.');
      }
    }
  },

  /**
   * GET TRANSACTION HISTORY - Bonus Feature
   * Fetches all transactions for a specific account
   */
  getTransactionHistory: async (accountNumber) => {
    try {
      const response = await api.get(`/transactions/account/${accountNumber}`);
      
      // Ensure we return an array
      const transactions = Array.isArray(response.data) ? response.data : [];
      
      // Sort by date descending (most recent first)
      transactions.sort((a, b) => {
        const dateA = new Date(a.transactionDate || a.createdDate || 0);
        const dateB = new Date(b.transactionDate || b.createdDate || 0);
        return dateB - dateA;
      });
      
      console.log(`Retrieved ${transactions.length} transactions for account ${accountNumber}`);
      
      return transactions;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `Failed to fetch transaction history: ${error.response.statusText}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Unable to connect to server. Please check your connection and try again.');
      } else {
        throw new Error('An unexpected error occurred while fetching transaction history.');
      }
    }
  },

  /**
   * GET ALL TRANSACTIONS - Admin Feature
   * Fetches all transactions (for admin/reporting purposes)
   */
  getAllTransactions: async (page = 0, size = 50) => {
    try {
      const response = await api.get(`/transactions?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  },

  /**
   * GET RECENT TRANSACTIONS - Dashboard Feature
   * Fetches most recent transactions across all accounts
   */
  getRecentTransactions: async (limit = 10) => {
    try {
      const response = await api.get(`/transactions/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  },

  /**
   * VALIDATE TRANSACTION - Pre-validation
   * Validates transaction before processing (optional)
   */
  validateTransaction: async (transactionData) => {
    try {
      // This would call a validation endpoint if you have one
      const response = await api.post('/transactions/validate', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error validating transaction:', error);
      throw error;
    }
  }
};

// ========================================
// TRANSACTION UTILITY FUNCTIONS
// ========================================

/**
 * Format transaction amount for display
 */
export const formatTransactionAmount = (amount, type) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(Math.abs(amount));
  
  return type?.toUpperCase() === 'WITHDRAWAL' ? `-${formattedAmount}` : formattedAmount;
};

/**
 * Get transaction type display name
 */
export const getTransactionTypeDisplay = (type) => {
  const types = {
    'DEPOSIT': 'Deposit',
    'WITHDRAWAL': 'Withdrawal', 
    'TRANSFER': 'Transfer',
    'FEE': 'Fee',
    'INTEREST': 'Interest'
  };
  
  return types[type?.toUpperCase()] || 'Transaction';
};

/**
 * Validate account number format (customize based on your format)
 */
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) return false;
  
  // Customize this regex based on your account number format
  // This is a general pattern - adjust as needed
  const accountPattern = /^[A-Za-z0-9]{3,20}$/;
  return accountPattern.test(accountNumber.trim());
};

/**
 * Validate transaction amount
 */
export const validateTransactionAmount = (amount, maxAmount = 1000000) => {
  if (!amount) return { valid: false, message: 'Amount is required' };
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { valid: false, message: 'Please enter a valid number' };
  }
  
  if (numAmount <= 0) {
    return { valid: false, message: 'Amount must be greater than 0' };
  }
  
  if (numAmount > maxAmount) {
    return { valid: false, message: `Amount cannot exceed $${maxAmount.toLocaleString()}` };
  }
  
  return { valid: true, message: '' };
};

/**
 * Calculate transaction fee (if applicable)
 */
export const calculateTransactionFee = (amount, transactionType, accountType = 'SAVINGS') => {
  // Customize fee calculation based on your business rules
  const feeRates = {
    'SAVINGS': {
      'DEPOSIT': 0, // No fee for deposits
      'WITHDRAWAL': amount > 1000 ? 5 : 0 // $5 fee for withdrawals over $1000
    },
    'CURRENT': {
      'DEPOSIT': 0,
      'WITHDRAWAL': 2 // $2 fee for all withdrawals
    },
    'FIXED_DEPOSIT': {
      'DEPOSIT': 0,
      'WITHDRAWAL': 25 // $25 early withdrawal fee
    }
  };
  
  return feeRates[accountType]?.[transactionType] || 0;
};

// ========================================
// ERROR HANDLING UTILITIES
// ========================================

/**
 * Parse API error messages for user-friendly display
 */
export const parseTransactionError = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Common transaction errors
  const errorMappings = {
    'INSUFFICIENT_FUNDS': 'Insufficient funds in your account',
    'ACCOUNT_NOT_FOUND': 'Account not found. Please check the account number',
    'ACCOUNT_CLOSED': 'Cannot process transaction. Account is closed',
    'ACCOUNT_SUSPENDED': 'Account is temporarily suspended',
    'INVALID_AMOUNT': 'Please enter a valid amount',
    'DAILY_LIMIT_EXCEEDED': 'Daily transaction limit exceeded',
    'INVALID_ACCOUNT_NUMBER': 'Invalid account number format',
    'TRANSACTION_LIMIT_EXCEEDED': 'Transaction amount exceeds allowed limit',
    'ACCOUNT_INACTIVE': 'Account is inactive. Please contact support'
  };
  
  // Check if error message contains known error codes
  const errorMessage = error.message || error.toString();
  
  for (const [code, userMessage] of Object.entries(errorMappings)) {
    if (errorMessage.toUpperCase().includes(code)) {
      return userMessage;
    }
  }
  
  // Return the original error message if no mapping found
  return errorMessage;
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