import React, { useState } from 'react';
import { accountAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './InquireAccount.css';

/**
 * InquireAccount Component
 * Assessment Requirement: "Inquire Account: Accepts account number and returns the details 
 * of the account holder and the account status."
 * 
 * Features:
 * - Account number input with validation
 * - API integration with backend GET /api/accounts/{accountNumber}
 * - Detailed account information display
 * - Account holder information
 * - Professional error handling and loading states
 */
const InquireAccount = () => {
  // Component state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [searchError, setSearchError] = useState('');

  /**
   * Handle input changes and clear errors
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setAccountNumber(value);
    
    // Clear search error when user starts typing
    if (searchError) {
      setSearchError('');
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!accountNumber.trim()) {
      setSearchError('Account number is required');
      return;
    }

    if (accountNumber.trim().length < 3) {
      setSearchError('Please enter a valid account number');
      return;
    }

    setLoading(true);
    setError(null);
    setAccount(null);
    setSearchError('');

    try {
      // Call the account API to get account details
      const result = await accountAPI.getAccountByNumber(accountNumber.trim());
      setAccount(result);
    } catch (err) {
      console.error('Account inquiry error:', err);
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
    setAccount(null);
  };

  /**
   * Format date for display
   */
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

  /**
   * Get status color class
   */
  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'status-active';
      case 'CLOSED': return 'status-closed';
      case 'SUSPENDED': return 'status-suspended';
      default: return 'status-unknown';
    }
  };

  /**
   * Get account type display name
   */
  const getAccountTypeDisplay = (type) => {
    const types = {
      'SAVINGS': 'Savings Account',
      'CURRENT': 'Current Account', 
      'FIXED_DEPOSIT': 'Fixed Deposit Account',
      'CHECKING': 'Checking Account'
    };
    return types[type?.toUpperCase()] || type;
  };

  // Show loading spinner during account search
  if (loading) {
    return <LoadingSpinner message="Searching for account..." />;
  }

  return (
    <div className="inquire-account">
      {/* Header Section */}
      <div className="inquire-account-header">
        <h2>🔍 Account Inquiry</h2>
        <p>Search and view detailed account information</p>
      </div>
      
      {/* Search Form */}
      <div className="search-section">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-group">
            <label htmlFor="accountNumber">Account Number *</label>
            <div className="search-input-container">
              <input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={handleInputChange}
                placeholder="Enter account number"
                className={searchError ? 'error' : ''}
                disabled={loading}
              />
              <button
                type="submit"
                className="search-button"
                disabled={loading || !accountNumber.trim()}
              >
                <span className="search-icon">🔍</span>
                Search
              </button>
            </div>
            {searchError && (
              <span className="error-text">{searchError}</span>
            )}
            <small className="help-text">
              Enter the account number to view account details
            </small>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && <ErrorMessage error={error} onRetry={handleRetry} />}
      
      {/* Account Details Display */}
      {account && (
        <div className="account-details-section">
          <div className="account-summary">
            <h3>Account Information</h3>
            <div className="summary-badges">
              <span className={`status-badge ${getStatusClass(account.status)}`}>
                {account.status}
              </span>
              <span className="type-badge">
                {getAccountTypeDisplay(account.accountType)}
              </span>
            </div>
          </div>
          
          <div className="details-grid">
            {/* Account Information Card */}
            <div className="details-card">
              <h4>🏦 Account Details</h4>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="detail-label">Account Number:</span>
                  <span className="detail-value account-number">
                    {account.accountNumber}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Account Type:</span>
                  <span className="detail-value">
                    {getAccountTypeDisplay(account.accountType)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Current Status:</span>
                  <span className={`detail-value ${getStatusClass(account.status)}`}>
                    {account.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Current Balance:</span>
                  <span className="detail-value balance">
                    ${parseFloat(account.balance || 0).toFixed(2)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created Date:</span>
                  <span className="detail-value">
                    {formatDate(account.createdDate)}
                  </span>
                </div>
                {account.updatedDate && (
                  <div className="detail-row">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">
                      {formatDate(account.updatedDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Holder Information Card */}
            <div className="details-card">
              <h4>👤 Account Holder</h4>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="detail-label">Customer ID:</span>
                  <span className="detail-value">
                    {account.customerId || account.customer?.id || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Customer Name:</span>
                  <span className="detail-value customer-name">
                    {account.customerName || account.customer?.name || 'N/A'}
                  </span>
                </div>
                {(account.customer?.email || account.customerEmail) && (
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      {account.customer?.email || account.customerEmail}
                    </span>
                  </div>
                )}
                {(account.customer?.phone || account.customerPhone) && (
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      {account.customer?.phone || account.customerPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Statistics Card */}
            <div className="details-card">
              <h4>📊 Account Statistics</h4>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="detail-label">Account Age:</span>
                  <span className="detail-value">
                    {account.createdDate 
                      ? Math.floor((new Date() - new Date(account.createdDate)) / (1000 * 60 * 60 * 24))
                      : 0
                    } days
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Account Activity:</span>
                  <span className="detail-value">
                    {account.status === 'ACTIVE' ? 'Active & Available' : 'Inactive'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Balance Status:</span>
                  <span className="detail-value">
                    {parseFloat(account.balance || 0) > 0 ? 'Positive Balance' : 
                     parseFloat(account.balance || 0) === 0 ? 'Zero Balance' : 'Negative Balance'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="account-actions">
            <button 
              className="action-button secondary"
              onClick={() => {
                setAccount(null);
                setAccountNumber('');
              }}
            >
              Search Another Account
            </button>
          </div>
        </div>
      )}
      
      {/* No Results Message */}
      {!account && !loading && !error && accountNumber && (
        <div className="no-results">
          <div className="no-results-icon">📭</div>
          <h3>No Account Found</h3>
          <p>No account found with number: <strong>{accountNumber}</strong></p>
          <p>Please check the account number and try again.</p>
        </div>
      )}

      {/* Welcome Message */}
      {!accountNumber && !loading && !account && !error && (
        <div className="welcome-message">
          <div className="welcome-icon">🏦</div>
          <h3>Account Information Lookup</h3>
          <p>Enter an account number above to view detailed account information</p>
          <div className="features-list">
            <h4>Information Available:</h4>
            <ul>
              <li>✅ Complete account details and status</li>
              <li>✅ Account holder information</li>
              <li>✅ Current balance and account type</li>
              <li>✅ Account creation and update dates</li>
              <li>✅ Account activity and statistics</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquireAccount;