import React, { useState, useEffect } from 'react';
import { accountAPI, customerAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './CreateAccount.css';

/**
 * CreateAccount Component
 * Assessment Requirement: "Create Account: Accepts account type, and creates an account 
 * with an auto-generated number. Account status should be set as 'Active'."
 * 
 * Features:
 * - Customer selection dropdown
 * - Account type selection
 * - Form validation
 * - API integration with backend POST /api/accounts
 * - Success confirmation with account details
 */
const CreateAccount = () => {
  // Component state management
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    accountType: '',
    initialBalance: ''
  });
  const [formErrors, setFormErrors] = useState({});

  /**
   * Load customers on component mount
   */
  useEffect(() => {
    const loadCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const customerList = await customerAPI.getAllCustomers();
        setCustomers(Array.isArray(customerList) ? customerList : []);
      } catch (error) {
        console.error('Failed to load customers:', error);
        setCustomers([]);
        // Don't show error for customer loading - just log it
      } finally {
        setLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, []);

  /**
   * Handle input changes and clear field-specific errors
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    const errors = {};
    
    // Customer validation
    if (!formData.customerId) {
      errors.customerId = 'Please select a customer';
    }
    
    // Account type validation
    if (!formData.accountType) {
      errors.accountType = 'Please select account type';
    }
    
    // Initial balance validation (optional but if provided, must be valid)
    if (formData.initialBalance && parseFloat(formData.initialBalance) < 0) {
      errors.initialBalance = 'Initial balance cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare account data for API call
      const accountData = {
        customerId: parseInt(formData.customerId),
        accountType: formData.accountType,
        initialBalance: formData.initialBalance ? parseFloat(formData.initialBalance) : 0
      };
      
      // Call the account API to create the account
      const result = await accountAPI.createAccount(accountData);
      
      setSuccess({
        message: 'Account created successfully!',
        data: result
      });
      
      // Clear form after successful creation
      setFormData({
        customerId: '',
        accountType: '',
        initialBalance: ''
      });
      
    } catch (err) {
      console.error('Create account error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retry after error
   */
  const handleRetry = () => {
    setError(null);
  };

  /**
   * Get customer name by ID for display
   */
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    return customer ? customer.name : 'Unknown Customer';
  };

  // Show loading spinner during account creation
  if (loading) {
    return <LoadingSpinner message="Creating account..." />;
  }

  return (
    <div className="create-account">
      {/* Header Section */}
      <div className="create-account-header">
        <h2>🏦 Create New Account</h2>
        <p>Create a new banking account for an existing customer</p>
      </div>

      {/* Error Display */}
      {error && <ErrorMessage error={error} onRetry={handleRetry} />}
      
      {/* Success Message */}
      {success && (
        <div className="success-message">
          <h3>✅ Account Created Successfully!</h3>
          <p>{success.message}</p>
          <div className="account-creation-details">
            <div className="detail-row">
              <span>Account Number:</span>
              <span className="account-number">{success.data.accountNumber}</span>
            </div>
            <div className="detail-row">
              <span>Account Type:</span>
              <span>{success.data.accountType}</span>
            </div>
            <div className="detail-row">
              <span>Status:</span>
              <span className="status-active">{success.data.status}</span>
            </div>
            <div className="detail-row">
              <span>Customer:</span>
              <span>{success.data.customerName || getCustomerName(formData.customerId)}</span>
            </div>
            <div className="detail-row">
              <span>Initial Balance:</span>
              <span className="balance">${parseFloat(success.data.balance || 0).toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span>Created Date:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Account Creation Form */}
      <form onSubmit={handleSubmit} className="create-account-form">
        {/* Customer Selection */}
        <div className="form-group">
          <label htmlFor="customerId">Select Customer *</label>
          <select
            id="customerId"
            name="customerId"
            value={formData.customerId}
            onChange={handleInputChange}
            className={formErrors.customerId ? 'error' : ''}
            disabled={loading || loadingCustomers}
          >
            <option value="">
              {loadingCustomers ? 'Loading customers...' : 'Select a customer'}
            </option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} (ID: {customer.id})
              </option>
            ))}
          </select>
          {formErrors.customerId && (
            <span className="error-text">{formErrors.customerId}</span>
          )}
          <small className="help-text">
            {customers.length > 0 
              ? `${customers.length} customers available`
              : 'No customers available - create a customer first'
            }
          </small>
        </div>

        {/* Account Type Selection */}
        <div className="form-group">
          <label htmlFor="accountType">Account Type *</label>
          <select
            id="accountType"
            name="accountType"
            value={formData.accountType}
            onChange={handleInputChange}
            className={formErrors.accountType ? 'error' : ''}
            disabled={loading}
          >
            <option value="">Select account type</option>
            <option value="SAVINGS">Savings Account</option>
            <option value="CURRENT">Current Account</option>
            <option value="FIXED_DEPOSIT">Fixed Deposit Account</option>
          </select>
          {formErrors.accountType && (
            <span className="error-text">{formErrors.accountType}</span>
          )}
          <small className="help-text">
            Choose the type of account to create
          </small>
        </div>

        {/* Initial Balance (Optional) */}
        <div className="form-group">
          <label htmlFor="initialBalance">Initial Balance (Optional)</label>
          <div className="balance-input-container">
            <span className="currency-symbol">$</span>
            <input
              id="initialBalance"
              name="initialBalance"
              type="number"
              value={formData.initialBalance}
              onChange={handleInputChange}
              className={formErrors.initialBalance ? 'error' : ''}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>
          {formErrors.initialBalance && (
            <span className="error-text">{formErrors.initialBalance}</span>
          )}
          <small className="help-text">
            Optional opening balance for the account (minimum $0.00)
          </small>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="create-button"
            disabled={loading || !formData.customerId || !formData.accountType || loadingCustomers}
          >
            <span className="button-icon">🏦</span>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>

      {/* Information Section */}
      <div className="create-account-info">
        <h4>Account Creation Information:</h4>
        <ul>
          <li>Account numbers are automatically generated and unique</li>
          <li>New accounts are created with "ACTIVE" status by default</li>
          <li>Initial balance is optional and defaults to $0.00</li>
          <li>Account types determine available features and limitations</li>
          <li>Customer must exist in the system before creating an account</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateAccount;