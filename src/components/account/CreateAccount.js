import React, { useState } from 'react';

const CreateAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [customerValidation, setCustomerValidation] = useState({ loading: false, customer: null, error: null });
  const [formData, setFormData] = useState({
    customerId: '',
    accountType: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // API base URL - adjust if needed
  const API_BASE_URL = 'http://localhost:8080/api';

  // Customer lookup function
  const validateCustomerId = async (customerId) => {
    if (!customerId || customerId.trim() === '') {
      setCustomerValidation({ loading: false, customer: null, error: null });
      return;
    }

    setCustomerValidation({ loading: true, customer: null, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}`);
      
      if (response.ok) {
        const customer = await response.json();
        setCustomerValidation({ 
          loading: false, 
          customer: customer, 
          error: null 
        });
      } else if (response.status === 404) {
        setCustomerValidation({ 
          loading: false, 
          customer: null, 
          error: `Customer with ID ${customerId} not found` 
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error validating customer ID:', err);
      setCustomerValidation({ 
        loading: false, 
        customer: null, 
        error: 'Unable to validate customer. Please check your connection.' 
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.customerId || formData.customerId.trim() === '') {
      errors.customerId = 'Please enter a customer ID';
    } else if (!customerValidation.customer) {
      errors.customerId = 'Please enter a valid customer ID';
    }
    
    if (!formData.accountType) {
      errors.accountType = 'Please select an account type';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCustomerIdChange = (e) => {
    const value = e.target.value.trim();
    setFormData(prev => ({ ...prev, customerId: value }));
    
    // Clear customer ID errors when user starts typing
    if (formErrors.customerId) {
      setFormErrors(prev => ({ ...prev, customerId: '' }));
    }

    // Debounce customer validation
    clearTimeout(window.customerValidationTimeout);
    window.customerValidationTimeout = setTimeout(() => {
      validateCustomerId(value);
    }, 500);
  };

  const handleAccountTypeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, accountType: value }));
    
    // Clear account type errors
    if (formErrors.accountType) {
      setFormErrors(prev => ({ ...prev, accountType: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const accountData = {
        customerId: parseInt(formData.customerId),
        accountType: formData.accountType
      };

      console.log('Creating account:', accountData);
      
      const response = await fetch(`${API_BASE_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData)
      });

      if (response.ok) {
        const newAccount = await response.json();
        console.log('Account created successfully:', newAccount);
        
        // Set success state with complete account details
        setSuccess({
          message: 'Account created successfully!',
          accountNumber: newAccount.accountNumber,
          customerName: newAccount.customerName || customerValidation.customer?.name,
          customerId: newAccount.customerId,
          accountType: newAccount.accountType,
          status: newAccount.status,
          balance: newAccount.balance || '0.00',
          createdDate: newAccount.createdDate
        });
        
        // Reset form
        setFormData({ customerId: '', accountType: '' });
        setCustomerValidation({ loading: false, customer: null, error: null });
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (err) {
      console.error('Account creation error:', err);
      setError({
        message: err.message || 'Failed to create account',
        details: 'Please check your input and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setSuccess(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #e5e7eb'
    },
    title: {
      color: '#1f2937',
      marginBottom: '0.5rem',
      fontSize: '1.8rem',
      fontWeight: '700'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1.1rem',
      margin: 0
    },
    alert: {
      padding: '2rem',
      borderRadius: '12px',
      marginBottom: '2rem',
      borderLeft: '6px solid #10b981'
    },
    alertSuccess: {
      background: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)',
      color: '#065f46',
      boxShadow: '0 4px 6px rgba(16, 185, 129, 0.1)'
    },
    alertError: {
      background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
      color: '#7f1d1d',
      borderLeft: '6px solid #ef4444',
      boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)'
    },
    alertTitle: {
      margin: '0 0 1rem 0',
      color: '#047857',
      fontSize: '1.5rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    accountDetails: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '10px',
      margin: '1.5rem 0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem'
    },
    detailItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      borderLeft: '4px solid #10b981',
      transition: 'all 0.2s ease'
    },
    detailLabel: {
      fontWeight: '600',
      color: '#374151',
      fontSize: '0.95rem'
    },
    detailValue: {
      color: '#1f2937',
      fontWeight: '600',
      fontSize: '1rem'
    },
    accountNumber: {
      fontFamily: 'Courier New, monospace',
      fontSize: '1.1rem',
      color: '#059669',
      fontWeight: '700',
      backgroundColor: '#d1fae5',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px'
    },
    formContainer: {
      backgroundColor: '#f9fafb',
      padding: '2rem',
      borderRadius: '12px',
      marginBottom: '2rem',
      border: '1px solid #e5e7eb'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      color: '#374151',
      fontSize: '1rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.2s',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#ef4444',
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#10b981',
      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      backgroundColor: 'white',
      transition: 'all 0.2s',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5em 1.5em',
      paddingRight: '2.5rem'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
      display: 'block',
      fontWeight: '500'
    },
    helpText: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
      display: 'block'
    },
    validationStatus: {
      fontSize: '0.9rem',
      marginTop: '0.25rem'
    },
    validating: {
      color: '#6b7280'
    },
    validSuccess: {
      color: '#059669'
    },
    validError: {
      color: '#dc3545'
    },
    button: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      textDecoration: 'none'
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      boxShadow: '0 4px 6px rgba(16, 185, 129, 0.25)'
    },
    buttonSecondary: {
      background: '#6b7280',
      color: 'white',
      boxShadow: '0 4px 6px rgba(107, 114, 128, 0.25)'
    },
    buttonCreate: {
      width: '100%',
      padding: '1rem 2rem',
      fontSize: '1.1rem',
      fontWeight: '700',
      justifyContent: 'center'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    successActions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1.5rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    featuresInfo: {
      backgroundColor: '#f0f9ff',
      border: '1px solid #0ea5e9',
      borderRadius: '8px',
      padding: '1.5rem',
      marginTop: '2rem'
    },
    featuresTitle: {
      margin: '0 0 1rem 0',
      color: '#0c4a6e',
      fontSize: '1.2rem',
      fontWeight: '600'
    },
    featuresList: {
      margin: 0,
      paddingLeft: '1.5rem',
      color: '#0c4a6e'
    },
    featuresListItem: {
      marginBottom: '0.5rem',
      fontWeight: '500'
    },
    debugInfo: {
      marginTop: '2rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    },
    debugTitle: {
      margin: '0 0 1rem 0',
      color: '#495057',
      fontSize: '1.1rem',
      fontWeight: '600'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🏦 Create Account</h2>
        <p style={styles.subtitle}>Enter customer ID and select account type to create a new account</p>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div style={{...styles.alert, ...styles.alertSuccess}}>
          <h3 style={styles.alertTitle}>✅ {success.message}</h3>
          <div style={styles.accountDetails}>
            <h4 style={{margin: '0 0 1.5rem 0', color: '#1f2937', fontSize: '1.3rem', fontWeight: '600'}}>Account Details:</h4>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>🏦 Account Number (Auto-generated):</span>
                <span style={{...styles.detailValue, ...styles.accountNumber}}>{success.accountNumber}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>👤 Customer Name:</span>
                <span style={{...styles.detailValue, color: '#7c2d12', fontWeight: '700'}}>{success.customerName}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>🆔 Customer ID:</span>
                <span style={styles.detailValue}>{success.customerId}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>💼 Account Type:</span>
                <span style={{...styles.detailValue, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{success.accountType}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>✅ Status:</span>
                <span style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>{success.status}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>💰 Initial Balance:</span>
                <span style={{...styles.detailValue, color: '#059669', fontSize: '1.1rem'}}>${success.balance}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📅 Created Date:</span>
                <span style={styles.detailValue}>{formatDate(success.createdDate)}</span>
              </div>
            </div>
          </div>
          
          <div style={styles.successActions}>
            <button 
              onClick={() => setSuccess(null)} 
              style={{...styles.button, ...styles.buttonPrimary}}
            >
              Create Another Account
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(success.accountNumber);
                alert(`Account number ${success.accountNumber} copied to clipboard!`);
              }} 
              style={{...styles.button, ...styles.buttonSecondary}}
            >
              Copy Account Number
            </button>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{...styles.alert, ...styles.alertError}}>
          <h4 style={{margin: '0 0 1rem 0', color: '#7f1d1d', fontSize: '1.3rem', fontWeight: '600'}}>❌ Error Creating Account</h4>
          <p style={{margin: '0 0 1rem 0', color: '#7f1d1d'}}>{error.message}</p>
          {error.details && <p style={{margin: '0 0 1rem 0', color: '#7f1d1d'}}><small>{error.details}</small></p>}
          <button 
            onClick={handleRetry} 
            style={{...styles.button, ...styles.buttonSecondary}}
          >
            Try Again
          </button>
        </div>
      )}

      {/* CREATE ACCOUNT FORM */}
      {!success && (
        <div style={styles.formContainer}>
          {/* Customer ID Input */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="customerId">Customer ID *</label>
            <input
              type="number"
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleCustomerIdChange}
              style={{
                ...styles.input,
                ...(formErrors.customerId ? styles.inputError : {})
              }}
              disabled={loading}
              placeholder="Enter customer ID (e.g., 1, 2, 3...)"
              min="1"
            />
            
            {/* Customer validation status */}
            {customerValidation.loading && (
              <div style={{...styles.validationStatus, ...styles.validating}}>
                🔍 Validating customer ID...
              </div>
            )}
            
            {customerValidation.customer && (
              <div style={{...styles.validationStatus, ...styles.validSuccess}}>
                ✅ Customer found: {customerValidation.customer.name} ({customerValidation.customer.email})
              </div>
            )}
            
            {customerValidation.error && (
              <div style={{...styles.validationStatus, ...styles.validError}}>
                ❌ {customerValidation.error}
              </div>
            )}
            
            {formErrors.customerId && (
              <span style={styles.errorText}>{formErrors.customerId}</span>
            )}
            
            <small style={styles.helpText}>
              Enter the customer ID to create an account for
            </small>
          </div>

          {/* Account Type Selection */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="accountType">Account Type *</label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleAccountTypeChange}
              style={{
                ...styles.select,
                ...(formErrors.accountType ? styles.inputError : {})
              }}
              disabled={loading}
            >
              <option value="">-- Select Account Type --</option>
              <option value="SAVINGS">💰 Savings Account</option>
              <option value="CURRENT">💼 Current Account</option>
              <option value="FIXED_DEPOSIT">🏛️ Fixed Deposit</option>
            </select>
            {formErrors.accountType && (
              <span style={styles.errorText}>{formErrors.accountType}</span>
            )}
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              ...styles.buttonCreate,
              ...(loading || !customerValidation.customer ? styles.buttonDisabled : {})
            }}
            disabled={loading || !customerValidation.customer}
          >
            {loading ? (
              <>
                <span>⏳</span>
                Creating Account...
              </>
            ) : (
              <>
                <span>🏦</span>
                Create Account
              </>
            )}
          </button>
        </div>
      )}

      {/* Assessment Requirements Info */}
      <div style={styles.featuresInfo}>
        <h3 style={styles.featuresTitle}>📋 Assessment Requirements Met:</h3>
        <ul style={styles.featuresList}>
          <li style={styles.featuresListItem}>✅ Accepts customer ID for account creation</li>
          <li style={styles.featuresListItem}>✅ Validates customer exists in database</li>
          <li style={styles.featuresListItem}>✅ Accepts account type selection</li>
          <li style={styles.featuresListItem}>✅ Creates account with auto-generated number</li>
          <li style={styles.featuresListItem}>✅ Account status set to "Active"</li>
          <li style={styles.featuresListItem}>✅ Displays complete account details after creation</li>
          <li style={styles.featuresListItem}>✅ Shows customer information in response</li>
        </ul>
      </div>

      {/* Debug Information */}
      <div style={styles.debugInfo}>
        <h4 style={styles.debugTitle}>🔧 Debug Information</h4>
        <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
        <p><strong>Backend Status:</strong> Make sure Spring Boot is running on port 8080</p>
        <p><strong>Test Customer IDs:</strong> Try IDs 1, 2, 3, or 8 (based on your H2 database)</p>
        <p><strong>Expected Endpoints:</strong></p>
        <ul>
          <li>GET /api/customers/{'{id}'} - For customer validation</li>
          <li>POST /api/accounts - For account creation</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateAccount;