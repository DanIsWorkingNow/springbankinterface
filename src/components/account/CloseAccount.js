import React, { useState } from 'react';
import { accountAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './CloseAccount.css';

/**
 * CloseAccount Component
 * Assessment Requirement: "Close Account: Accepts account number and updates the status to 'Closed'"
 * 
 * Features:
 * - Form validation for account number
 * - API integration with backend PUT /api/accounts/{accountNumber}/close
 * - Error handling with user-friendly messages
 * - Loading states during API calls
 * - Success confirmation with account details
 * - Warning messages about account closure
 */
const CloseAccount = () => {
  // Component state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  /**
   * Handle input changes and clear field-specific errors
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setAccountNumber(value);
    
    // Clear field error when user starts typing
    if (formErrors.accountNumber) {
      setFormErrors({ ...formErrors, accountNumber: '' });
    }
    
    // Hide confirmation dialog if user changes account number
    if (showConfirmation) {
      setShowConfirmation(false);
    }
  };

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    const errors = {};
    
    if (!accountNumber.trim()) {
      errors.accountNumber = 'Account number is required';
    } else if (accountNumber.trim().length < 3) {
      errors.accountNumber = 'Please enter a valid account number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission - show confirmation dialog first
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Show confirmation dialog before closing account
    setShowConfirmation(true);
    setError(null);
  };

  /**
   * Confirm account closure and call API
   */
  const confirmCloseAccount = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setShowConfirmation(false);

    try {
      // Call the account API to close the account
      const result = await accountAPI.closeAccount(accountNumber.trim());
      
      setSuccess({
        message: 'Account closed successfully!',
        data: result
      });
      
      // Clear form after successful closure
      setAccountNumber('');
      
    } catch (err) {
      console.error('Close account error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel account closure confirmation
   */
  const cancelCloseAccount = () => {
    setShowConfirmation(false);
  };

  /**
   * Retry after error
   */
  const handleRetry = () => {
    setError(null);
  };

  // Show loading spinner during API call
  if (loading) {
    return <LoadingSpinner message="Closing account..." />;
  }

  return (
    <div className="close-account">
      {/* Header Section */}
      <div className="close-account-header">
        <h2>🔒 Close Account</h2>
        <p>Permanently close an account and update its status</p>
      </div>
      
      {/* Warning Notice */}
      <div className="warning-notice">
        <div className="warning-icon">⚠️</div>
        <div className="warning-content">
          <h4>Important Notice</h4>
          <p>
            Closing an account will permanently change its status to "CLOSED". 
            Once closed, no further transactions can be performed on this account. 
            This action cannot be easily reversed.
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && <ErrorMessage error={error} onRetry={handleRetry} />}
      
      {/* Success Message */}
      {success && (
        <div className="success-message">
          <h3>✅ Account Closed Successfully!</h3>
          <p>{success.message}</p>
          <div className="account-closure-details">
            <div className="detail-row">
              <span>Account Number:</span>
              <span>{success.data.accountNumber}</span>
            </div>
            <div className="detail-row">
              <span>Account Type:</span>
              <span>{success.data.accountType}</span>
            </div>
            <div className="detail-row">
              <span>Previous Status:</span>
              <span className="status-previous">ACTIVE</span>
            </div>
            <div className="detail-row">
              <span>New Status:</span>
              <span className="status-closed">{success.data.status}</span>
            </div>
            <div className="detail-row">
              <span>Final Balance:</span>
              <span className="balance">${parseFloat(success.data.balance || 0).toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span>Customer:</span>
              <span>{success.data.customerName || success.data.customer?.name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span>Closure Date:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Account Closure Form */}
      <form onSubmit={handleSubmit} className="close-account-form">
        <div className="form-group">
          <label htmlFor="accountNumber">Account Number *</label>
          <input
            id="accountNumber"
            name="accountNumber"
            type="text"
            value={accountNumber}
            onChange={handleInputChange}
            className={formErrors.accountNumber ? 'error' : ''}
            placeholder="Enter account number to close"
            disabled={loading}
          />
          {formErrors.accountNumber && (
            <span className="error-text">{formErrors.accountNumber}</span>
          )}
          <small className="help-text">
            Enter the account number you wish to close permanently
          </small>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="close-button"
            disabled={loading || !accountNumber.trim()}
          >
            <span className="button-icon">🔒</span>
            Request Account Closure
          </button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <div className="confirmation-header">
              <h3>⚠️ Confirm Account Closure</h3>
            </div>
            <div className="confirmation-content">
              <p>Are you sure you want to close account <strong>{accountNumber}</strong>?</p>
              <div className="confirmation-warning">
                <h4>This action will:</h4>
                <ul>
                  <li>Change the account status to "CLOSED"</li>
                  <li>Prevent any future transactions on this account</li>
                  <li>Preserve the account history for record-keeping</li>
                  <li>Require administrator intervention to reopen</li>
                </ul>
              </div>
            </div>
            <div className="confirmation-actions">
              <button 
                className="confirm-button"
                onClick={confirmCloseAccount}
                disabled={loading}
              >
                Yes, Close Account
              </button>
              <button 
                className="cancel-button"
                onClick={cancelCloseAccount}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="close-account-info">
        <h4>Account Closure Information:</h4>
        <ul>
          <li>Closed accounts cannot process deposits, withdrawals, or transfers</li>
          <li>Account history and balance information remain accessible</li>
          <li>Reopening a closed account requires administrator approval</li>
          <li>Any remaining balance will be handled according to bank policy</li>
          <li>Automatic payments or direct deposits should be redirected beforehand</li>
        </ul>
      </div>
    </div>
  );
};

export default CloseAccount;