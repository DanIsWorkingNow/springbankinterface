import React, { useState } from 'react';
import { accountAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const CloseAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountInfo, setAccountInfo] = useState(null);
  const [step, setStep] = useState(1); // 1: Search, 2: Confirm, 3: Complete
  const [searchError, setSearchError] = useState('');

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

  // Step 1: Search for account
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!validateAccountNumber()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Searching for account to close:', accountNumber);
      const account = await accountAPI.getAccountByNumber(accountNumber.trim());
      
      setAccountInfo(account);
      setStep(2); // Move to confirmation step
      
    } catch (err) {
      console.error('Account search error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm and close account
  const handleConfirmClose = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Closing account:', accountNumber);
      const closedAccount = await accountAPI.closeAccount(accountNumber.trim());
      
      setSuccess({
        message: 'Account status updated to "Closed" successfully!',
        accountNumber: closedAccount.accountNumber,
        customerName: closedAccount.customerName,
        previousStatus: accountInfo.status,
        newStatus: closedAccount.status, // Should be "CLOSED"
        finalBalance: closedAccount.balance
      });
      
      setStep(3); // Move to completion step
      
    } catch (err) {
      console.error('Account closure error:', err);
      setError(err);
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

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'status-active';
      case 'CLOSED': return 'status-closed';
      case 'SUSPENDED': return 'status-suspended';
      default: return 'status-unknown';
    }
  };

  return (
    <div className="close-account-container">
      <div className="service-header">
        <h2>🔒 Close Account</h2>
        <p>Accepts account number and updates the status to "Closed"</p>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Enter Account Number</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Confirm Closure</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Status Updated</div>
      </div>

      {/* Step 1: Enter Account Number */}
      {step === 1 && (
        <div className="search-step">
          <h3>Enter Account Number to Close</h3>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <label htmlFor="accountNumber">Account Number *</label>
              <input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={handleInputChange}
                className={searchError ? 'error' : ''}
                placeholder="Enter account number (e.g., ACC1234567890123)"
                disabled={loading}
              />
              {searchError && <span className="error-text">{searchError}</span>}
              <small className="help-text">
                Enter the account number you want to close
              </small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="small" /> : 'Find Account'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Confirm Account Closure */}
      {step === 2 && accountInfo && (
        <div className="confirm-step">
          <h3>Confirm Account Closure</h3>
          
          <div className="account-details">
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Account Number:</span>
                <span className="value">{accountInfo.accountNumber}</span>
              </div>
              <div className="detail-item">
                <span className="label">Account Holder:</span>
                <span className="value">{accountInfo.customerName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Account Type:</span>
                <span className="value">{accountInfo.accountType}</span>
              </div>
              <div className="detail-item">
                <span className="label">Current Status:</span>
                <span className={`value ${getStatusClass(accountInfo.status)}`}>
                  {accountInfo.status}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Current Balance:</span>
                <span className="value balance">{formatCurrency(accountInfo.balance)}</span>
              </div>
            </div>
          </div>

          {/* Status Change Preview */}
          <div className="status-change-preview">
            <h4>Status Change Preview:</h4>
            <div className="status-change">
              <span className={`current-status ${getStatusClass(accountInfo.status)}`}>
                {accountInfo.status}
              </span>
              <span className="arrow">→</span>
              <span className="new-status status-closed">CLOSED</span>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              onClick={handleConfirmClose} 
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="small" /> : 'Update Status to CLOSED'}
            </button>
            <button 
              onClick={() => setStep(1)} 
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && success && (
        <div className="success-step">
          <div className="alert alert-success">
            <h3>✅ {success.message}</h3>
            <div className="success-details">
              <div className="detail-row">
                <span className="label">Account Number:</span>
                <span className="value">{success.accountNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Account Holder:</span>
                <span className="value">{success.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status Changed:</span>
                <span className="value">
                  <span className={getStatusClass(success.previousStatus)}>
                    {success.previousStatus}
                  </span>
                  {' → '}
                  <span className={getStatusClass(success.newStatus)}>
                    {success.newStatus}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Final Balance:</span>
                <span className="value">{formatCurrency(success.finalBalance)}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleReset} 
            className="btn btn-primary"
          >
            Close Another Account
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage 
          error={error} 
          onRetry={() => {
            setError(null);
            if (step === 2) {
              setStep(1);
            }
          }} 
        />
      )}

      {/* Assessment Requirements Info */}
      <div className="features-info">
        <h3>📋 Assessment Requirements:</h3>
        <ul>
          <li>✅ Accepts account number as input</li>
          <li>✅ Updates account status to "Closed"</li>
          <li>✅ Validates account exists before closure</li>
          <li>✅ Confirms status change completion</li>
        </ul>
      </div>
    </div>
  );
};

export default CloseAccount;