// src/components/customer/InquireCustomer.js
import React, { useState } from 'react';
import { customerAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

/**
 * Enhanced Inquire Customer Component
 * Matches the professional styling of Deposit/Withdraw Cash pages
 * Fixed to work with your existing API structure
 * Assessment Requirement: "Inquire Customer: Returns customer details by customer ID"
 */
const InquireCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [searchError, setSearchError] = useState('');

  const validateSearch = () => {
    if (!customerId.trim()) {
      setSearchError('Customer ID is required');
      return false;
    }
    
    const id = parseInt(customerId);
    if (isNaN(id) || id < 1) {
      setSearchError('Customer ID must be a positive number');
      return false;
    }
    
    setSearchError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSearch()) {
      return;
    }

    setLoading(true);
    setError(null);
    setCustomer(null);

    try {
      // Using your existing customerAPI structure
      const result = await customerAPI.getById(parseInt(customerId));
      setCustomer(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCustomerId(e.target.value);
    if (searchError) {
      setSearchError('');
    }
  };

  const handleRetry = () => {
    setError(null);
    setCustomer(null);
  };

  const handleNewSearch = () => {
    setCustomer(null);
    setError(null);
    setCustomerId('');
    setSearchError('');
  };

  const handleQuickSearch = (id) => {
    setCustomerId(id.toString());
    setSearchError('');
  };

  if (loading) {
    return <LoadingSpinner message="Searching for customer..." />;
  }

  return (
    <div className="springbank-container">
      {/* Header Section */}
      <div className="springbank-header">
        <h2 className="springbank-title">
          🔍 Customer Inquiry
        </h2>
        <p className="springbank-subtitle">
          Search and view customer details by ID
        </p>
      </div>

      {/* Search Form */}
      <div className="springbank-card">
        <form onSubmit={handleSubmit} className="springbank-form">
          <div className="springbank-form-group">
            <label className="springbank-label">
              Customer ID *
            </label>
            <input
              type="number"
              value={customerId}
              onChange={handleInputChange}
              placeholder="Enter customer ID"
              min="1"
              className={`springbank-input ${searchError ? 'error' : ''}`}
              disabled={loading}
              required
            />
            {searchError && (
              <span className="springbank-error-text">{searchError}</span>
            )}
            <span className="springbank-help-text">
              Enter a positive number (e.g., 1, 2, 3...)
            </span>
          </div>

          <div className="springbank-text-center">
            <button
              type="submit"
              disabled={loading}
              className="springbank-button springbank-button-secondary"
            >
              <span>🔍</span>
              Search Customer
            </button>
          </div>
        </form>

        {/* Quick Search Suggestions */}
        <div className="springbank-quick-search">
          <h4 className="springbank-quick-search-title">Quick Search (Sample Data):</h4>
          <div className="springbank-quick-search-buttons">
            {[1, 2, 3, 4, 5].map(id => (
              <button
                key={id}
                type="button"
                onClick={() => handleQuickSearch(id)}
                className="springbank-quick-search-btn"
                disabled={loading}
              >
                ID {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} onRetry={handleRetry} />}

      {/* Customer Details */}
      {customer && (
        <div className="springbank-success">
          <div className="springbank-flex-between springbank-mb-1">
            <h3 className="springbank-success-title">✅ Customer Found</h3>
            <button
              onClick={handleNewSearch}
              className="springbank-button springbank-button-small springbank-button-info"
            >
              New Search
            </button>
          </div>

          <div className="springbank-success-details">
            <div className="springbank-detail-row">
              <span className="springbank-detail-label">Customer ID:</span>
              <span className="springbank-highlight-value">{customer.id}</span>
            </div>

            <div className="springbank-detail-row">
              <span className="springbank-detail-label">Full Name:</span>
              <span className="springbank-detail-value">{customer.name}</span>
            </div>

            <div className="springbank-detail-row">
              <span className="springbank-detail-label">Email Address:</span>
              <span className="springbank-detail-value">
                {customer.email || 'Not provided'}
              </span>
            </div>

            <div className="springbank-detail-row">
              <span className="springbank-detail-label">Phone Number:</span>
              <span className="springbank-detail-value">
                {customer.phone || 'Not provided'}
              </span>
            </div>

            <div className="springbank-detail-row">
              <span className="springbank-detail-label">Created Date:</span>
              <span className="springbank-detail-value">
                {new Date(customer.createdDate).toLocaleString()}
              </span>
            </div>

            {customer.updatedDate && (
              <div className="springbank-detail-row">
                <span className="springbank-detail-label">Last Updated:</span>
                <span className="springbank-detail-value">
                  {new Date(customer.updatedDate).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="springbank-actions">
            <button
              onClick={() => {
                // Navigate to create account or trigger navigation
                alert('Navigate to Create Account for Customer ID: ' + customer.id);
              }}
              className="springbank-action-btn"
            >
              🏦 Create Account
            </button>
            <button
              onClick={() => {
                // Navigate to deposit cash or trigger navigation
                alert('Navigate to Deposit Cash');
              }}
              className="springbank-action-btn"
            >
              💰 Make Deposit
            </button>
            <button
              onClick={() => {
                // Navigate to withdraw cash or trigger navigation
                alert('Navigate to Withdraw Cash');
              }}
              className="springbank-action-btn"
            >
              💳 Withdraw Cash
            </button>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="springbank-info-section">
        <h4 className="springbank-info-title">Search Information:</h4>
        <ul className="springbank-info-list">
          <li>Use customer ID numbers to search (1, 2, 3, etc.)</li>
          <li>Sample customers with IDs 1-5 are available for testing</li>
          <li>Customer details include contact information and creation date</li>
          <li>After finding a customer, you can create accounts or transactions</li>
        </ul>
      </div>
    </div>
  );
};

export default InquireCustomer;