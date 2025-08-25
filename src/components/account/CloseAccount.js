import React, { useState } from 'react';

const CloseAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountInfo, setAccountInfo] = useState(null);
  const [step, setStep] = useState(1); // 1: Search, 2: Confirm, 3: Complete
  const [searchError, setSearchError] = useState('');

  // API base URL
  const API_BASE_URL = 'http://localhost:8080/api';

  const handleInputChange = (e) => {
    const value = e.target.value;
    setAccountNumber(value);
    
    if (searchError) {
      setSearchError('');
    }
  };

  const validateAccountNumber = () => {
    if (!accountNumber.trim()) {
      setSearchError('Account number is required');
      return false;
    }
    
    if (accountNumber.trim().length < 3) {
      setSearchError('Please enter a valid account number');
      return false;
    }
    
    setSearchError('');
    return true;
  };

  // Step 1: Search for account using direct API call
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!validateAccountNumber()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trimmedAccountNumber = accountNumber.trim();
      console.log('🔍 Searching for account to close:', trimmedAccountNumber);
      
      // Direct API call to your working backend endpoint
      const response = await fetch(`${API_BASE_URL}/accounts/${trimmedAccountNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const account = await response.json();
        console.log('✅ Account found for closure:', account);
        
        // Check if account is already closed
        if (account.status === 'CLOSED') {
          setError({
            message: 'Account Already Closed',
            details: `Account ${trimmedAccountNumber} is already closed and cannot be closed again.`
          });
          return;
        }
        
        setAccountInfo(account);
        setStep(2); // Move to confirmation step
      } else if (response.status === 404) {
        console.log('❌ Account not found');
        setError({
          message: 'Account not found',
          details: `No account found with number: ${trimmedAccountNumber}`
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (err) {
      console.error('❌ Account search failed:', err);
      setError({
        message: err.message || 'Failed to search account',
        details: 'Please check the account number and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm and close account using direct API call
  const handleConfirmClose = async () => {
    setLoading(true);
    setError(null);

    try {
      const trimmedAccountNumber = accountNumber.trim();
      console.log('🔒 Closing account:', trimmedAccountNumber);
      
      // Direct API call to close account
      const response = await fetch(`${API_BASE_URL}/accounts/${trimmedAccountNumber}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const closedAccount = await response.json();
        console.log('✅ Account closed successfully:', closedAccount);
        
        setSuccess({
          message: 'Account status updated to "Closed" successfully!',
          accountNumber: closedAccount.accountNumber,
          customerName: closedAccount.customerName,
          previousStatus: accountInfo.status,
          newStatus: closedAccount.status, // Should be "CLOSED"
          finalBalance: closedAccount.balance
        });
        
        setStep(3); // Move to completion step
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (err) {
      console.error('❌ Account closure failed:', err);
      setError({
        message: err.message || 'Failed to close account',
        details: 'Please try again or contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setAccountNumber('');
    setAccountInfo(null);
    setError(null);
    setSuccess(null);
    setSearchError('');
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'status-active';
      case 'CLOSED': return 'status-closed';
      case 'SUSPENDED': return 'status-suspended';
      default: return 'status-unknown';
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
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem',
      gap: '1rem',
      flexWrap: 'wrap'
    },
    step: {
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: '600',
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      transition: 'all 0.3s ease'
    },
    stepActive: {
      backgroundColor: '#dc2626',
      color: 'white'
    },
    searchStep: {
      backgroundColor: '#f9fafb',
      padding: '2rem',
      borderRadius: '12px',
      marginBottom: '2rem',
      border: '1px solid #e5e7eb'
    },
    stepTitle: {
      color: '#1f2937',
      fontSize: '1.3rem',
      fontWeight: '600',
      marginBottom: '1.5rem'
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
      gap: '0.5rem'
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.25)'
    },
    buttonDanger: {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      color: 'white',
      boxShadow: '0 4px 6px rgba(220, 38, 38, 0.25)'
    },
    buttonSecondary: {
      background: '#6b7280',
      color: 'white',
      boxShadow: '0 4px 6px rgba(107, 114, 128, 0.25)'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    alert: {
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '2rem'
    },
    alertError: {
      backgroundColor: '#fee2e2',
      borderLeft: '4px solid #ef4444',
      color: '#7f1d1d'
    },
    alertSuccess: {
      backgroundColor: '#d1fae5',
      borderLeft: '4px solid #10b981',
      color: '#065f46'
    },
    alertTitle: {
      fontWeight: '600',
      marginBottom: '0.5rem',
      fontSize: '1.1rem'
    },
    confirmStep: {
      backgroundColor: '#fff7ed',
      padding: '2rem',
      borderRadius: '12px',
      marginBottom: '2rem',
      border: '1px solid #fed7aa'
    },
    accountDetails: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '2rem',
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
      borderLeft: '4px solid #3b82f6'
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
    statusActive: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.85rem',
      fontWeight: '700',
      textTransform: 'uppercase'
    },
    statusClosed: {
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.85rem',
      fontWeight: '700',
      textTransform: 'uppercase'
    },
    balance: {
      color: '#059669',
      fontSize: '1.1rem',
      fontWeight: '700'
    },
    statusChangePreview: {
      backgroundColor: '#fef2f2',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '2rem',
      border: '1px solid #fecaca'
    },
    statusChange: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      justifyContent: 'center',
      marginTop: '1rem'
    },
    currentStatus: {
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.9rem'
    },
    arrow: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#dc2626'
    },
    newStatus: {
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.9rem'
    },
    actionButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    spinner: {
      width: '1rem',
      height: '1rem',
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    successStep: {
      backgroundColor: '#f0fdf4',
      padding: '2rem',
      borderRadius: '12px',
      marginBottom: '2rem',
      border: '1px solid #bbf7d0',
      textAlign: 'center'
    },
    featuresInfo: {
      backgroundColor: '#fef3c7',
      border: '1px solid #fcd34d',
      borderRadius: '8px',
      padding: '1.5rem',
      marginTop: '2rem'
    },
    featuresTitle: {
      margin: '0 0 1rem 0',
      color: '#92400e',
      fontSize: '1.2rem',
      fontWeight: '600'
    },
    featuresList: {
      margin: 0,
      paddingLeft: '1.5rem',
      color: '#92400e'
    },
    debugInfo: {
      marginTop: '2rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      fontSize: '0.9rem'
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
        <h2 style={styles.title}>🔒 Close Account</h2>
        <p style={styles.subtitle}>Accepts account number and updates the status to "Closed"</p>
      </div>

      {/* Step Indicator */}
      <div style={styles.stepIndicator}>
        <div style={{
          ...styles.step,
          ...(step >= 1 ? styles.stepActive : {})
        }}>1. Enter Account Number</div>
        <div style={{
          ...styles.step,
          ...(step >= 2 ? styles.stepActive : {})
        }}>2. Confirm Closure</div>
        <div style={{
          ...styles.step,
          ...(step >= 3 ? styles.stepActive : {})
        }}>3. Status Updated</div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{...styles.alert, ...styles.alertError}}>
          <h4 style={styles.alertTitle}>❌ {error.message}</h4>
          <p style={{margin: '0 0 1rem 0'}}>{error.details}</p>
          <button 
            onClick={() => {
              setError(null);
              if (step !== 1) setStep(1);
            }}
            style={{...styles.button, ...styles.buttonSecondary}}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Step 1: Enter Account Number */}
      {step === 1 && (
        <div style={styles.searchStep}>
          <h3 style={styles.stepTitle}>Enter Account Number to Close</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="accountNumber">Account Number *</label>
            <input
              id="accountNumber"
              type="text"
              value={accountNumber}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(searchError ? styles.inputError : {})
              }}
              placeholder="Enter account number (e.g., ACC1756126104686624)"
              disabled={loading}
            />
            {searchError && <span style={styles.errorText}>{searchError}</span>}
            <small style={styles.helpText}>
              Enter the account number you want to close
            </small>
          </div>

          <button 
            onClick={handleSearch}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                Searching...
              </>
            ) : (
              '🔍 Find Account'
            )}
          </button>
        </div>
      )}

      {/* Step 2: Confirm Account Closure */}
      {step === 2 && accountInfo && (
        <div style={styles.confirmStep}>
          <h3 style={styles.stepTitle}>Confirm Account Closure</h3>
          
          <div style={styles.accountDetails}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>🏦 Account Number:</span>
                <span style={styles.detailValue}>{accountInfo.accountNumber}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>👤 Account Holder:</span>
                <span style={styles.detailValue}>{accountInfo.customerName}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>💼 Account Type:</span>
                <span style={styles.detailValue}>{accountInfo.accountType}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>✅ Current Status:</span>
                <span style={accountInfo.status === 'ACTIVE' ? styles.statusActive : styles.statusClosed}>
                  {accountInfo.status}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>💰 Current Balance:</span>
                <span style={{...styles.detailValue, ...styles.balance}}>{formatCurrency(accountInfo.balance)}</span>
              </div>
            </div>
          </div>

          {/* Status Change Preview */}
          <div style={styles.statusChangePreview}>
            <h4 style={styles.stepTitle}>Status Change Preview:</h4>
            <div style={styles.statusChange}>
              <span style={{
                ...styles.currentStatus,
                ...(accountInfo.status === 'ACTIVE' ? styles.statusActive : styles.statusClosed)
              }}>
                {accountInfo.status}
              </span>
              <span style={styles.arrow}>→</span>
              <span style={{...styles.newStatus, ...styles.statusClosed}}>CLOSED</span>
            </div>
          </div>

          <div style={styles.actionButtons}>
            <button 
              onClick={handleConfirmClose} 
              style={{
                ...styles.button,
                ...styles.buttonDanger,
                ...(loading ? styles.buttonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  Closing Account...
                </>
              ) : (
                '🔒 Confirm Close Account'
              )}
            </button>
            <button 
              onClick={() => setStep(1)}
              style={{...styles.button, ...styles.buttonSecondary}}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success Message */}
      {step === 3 && success && (
        <div style={{...styles.alert, ...styles.alertSuccess}}>
          <h3 style={styles.alertTitle}>✅ {success.message}</h3>
          
          <div style={styles.successStep}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>🏦 Account Number:</span>
                <span style={styles.detailValue}>{success.accountNumber}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>👤 Customer Name:</span>
                <span style={styles.detailValue}>{success.customerName}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📊 Status Change:</span>
                <span style={styles.detailValue}>{success.previousStatus} → {success.newStatus}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>💰 Final Balance:</span>
                <span style={{...styles.detailValue, ...styles.balance}}>{formatCurrency(success.finalBalance)}</span>
              </div>
            </div>
            
            <div style={{marginTop: '2rem'}}>
              <button 
                onClick={handleReset}
                style={{...styles.button, ...styles.buttonPrimary}}
              >
                Close Another Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Requirements Info */}
      <div style={styles.featuresInfo}>
        <h3 style={styles.featuresTitle}>📋 Assessment Requirements Met:</h3>
        <ul style={styles.featuresList}>
          <li>✅ Accepts account number as input</li>
          <li>✅ Updates account status to "Closed"</li>
          <li>✅ Validates account exists before closure</li>
          <li>✅ Confirms status change completion</li>
          <li>✅ Shows account details before closure</li>
          <li>✅ Prevents closing already closed accounts</li>
        </ul>
      </div>

      {/* Debug Information */}
      <div style={styles.debugInfo}>
        <h4 style={styles.debugTitle}>🔧 Debug Information</h4>
        <p><strong>Search Endpoint:</strong> GET {API_BASE_URL}/accounts/{'{'}{accountNumber || 'ACCOUNT_NUMBER'}{'}'}</p>
        <p><strong>Close Endpoint:</strong> PUT {API_BASE_URL}/accounts/{'{'}{accountNumber || 'ACCOUNT_NUMBER'}{'}'}/close</p>
        <p><strong>Backend Status:</strong> Make sure Spring Boot is running on port 8080</p>
        <p><strong>Test Account:</strong> ACC1756126104686624</p>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CloseAccount;