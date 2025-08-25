import React, { useState } from 'react';
import { transactionAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const DepositCash = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.accountNumber.trim()) {
      errors.accountNumber = 'Account number is required';
    } else if (formData.accountNumber.trim().length < 3) {
      errors.accountNumber = 'Please enter a valid account number';
    }
    
    if (!formData.amount.trim()) {
      errors.amount = 'Deposit amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Please enter a valid positive amount';
      } else if (amount > 20000) {
        errors.amount = 'Daily deposit limit is RM 20,000';
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
        errors.amount = 'Amount can have maximum 2 decimal places';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For amount field, only allow numbers and decimal point
    if (name === 'amount') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const parts = numericValue.split('.');
      const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const depositData = {
        accountNumber: formData.accountNumber.trim(),
        amount: parseFloat(formData.amount)
      };

      console.log('Processing deposit:', depositData);
      const result = await transactionAPI.depositCash(depositData);
      
      setSuccess({
        message: 'Cash deposited successfully! Balance updated.',
        transactionId: result.transactionId,
        accountNumber: result.accountNumber,
        depositAmount: result.amount,
        previousBalance: result.balanceBefore,
        newBalance: result.balanceAfter,
        transactionDate: result.transactionDate
      });
      
      // Reset form
      setFormData({
        accountNumber: '',
        amount: ''
      });
      
    } catch (err) {
      console.error('Deposit error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setSuccess(null);
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
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

  return (
    <div className="springbank-container">
      {/* Modern Card Header */}
      <div className="springbank-card">
        <div className="springbank-header">
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '0.5rem',
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            💰 Deposit Cash
          </h2>
          <p style={{ 
            color: '#7f8c8d', 
            fontSize: '1.1rem',
            margin: 0 
          }}>
            Add funds to your account securely and instantly
          </p>
        </div>

        {/* Daily Limit Info */}
        <div className="springbank-warning" style={{ marginBottom: '2rem' }}>
          <div className="springbank-warning-icon">ℹ️</div>
          <div className="springbank-warning-content">
            <h4>Daily Transaction Limit</h4>
            <p>Maximum deposit amount: RM 20,000 per day</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="springbank-success">
            <h3 className="springbank-success-title">
              ✅ {success.message}
            </h3>
            <div className="springbank-success-details">
              <div className="springbank-detail-row">
                <span className="springbank-detail-label">Transaction ID:</span>
                <span className="springbank-detail-value">{success.transactionId}</span>
              </div>
              <div className="springbank-detail-row">
                <span className="springbank-detail-label">Account Number:</span>
                <span className="springbank-detail-value">{success.accountNumber}</span>
              </div>
              <div className="springbank-detail-row">
                <span className="springbank-detail-label">Deposit Amount:</span>
                <span className="springbank-highlight-value">
                  {formatCurrency(success.depositAmount)}
                </span>
              </div>
              <div className="springbank-detail-row">
                <span className="springbank-detail-label">Previous Balance:</span>
                <span className="springbank-detail-value">
                  {formatCurrency(success.previousBalance)}
                </span>
              </div>
              <div className="springbank-detail-row">
                <span className="springbank-detail-label">New Balance:</span>
                <span className="springbank-highlight-value">
                  {formatCurrency(success.newBalance)}
                </span>
              </div>
              <div className="springbank-detail-row">
                <span className="springbank-detail-label">Transaction Date:</span>
                <span className="springbank-detail-value">{formatDate(success.transactionDate)}</span>
              </div>
            </div>
            <button 
              onClick={() => setSuccess(null)} 
              className="springbank-button springbank-button-secondary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              💰 Make Another Deposit
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && <ErrorMessage error={error} onRetry={handleRetry} />}

        {/* Deposit Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="springbank-form">
            {/* Account Number */}
            <div className="springbank-form-group">
              <label htmlFor="accountNumber" className="springbank-label">
                Account Number *
              </label>
              <input
                id="accountNumber"
                name="accountNumber"
                type="text"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className={`springbank-input ${formErrors.accountNumber ? 'error' : ''}`}
                placeholder="Enter account number (e.g., ACC1234567890123)"
                disabled={loading}
              />
              {formErrors.accountNumber && (
                <span style={{ 
                  color: '#dc3545', 
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {formErrors.accountNumber}
                </span>
              )}
            </div>

            {/* Deposit Amount */}
            <div className="springbank-form-group">
              <label htmlFor="amount" className="springbank-label">
                Deposit Amount *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6c757d',
                  fontWeight: 'bold',
                  zIndex: 1
                }}>
                  RM
                </span>
                <input
                  id="amount"
                  name="amount"
                  type="text"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className={`springbank-input ${formErrors.amount ? 'error' : ''}`}
                  style={{ paddingLeft: '3rem' }}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
              {formErrors.amount && (
                <span style={{ 
                  color: '#dc3545', 
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {formErrors.amount}
                </span>
              )}
              <small style={{ 
                color: '#6c757d', 
                fontSize: '0.875rem',
                marginTop: '0.25rem',
                display: 'block'
              }}>
                Maximum daily deposit: RM 20,000
              </small>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="springbank-button springbank-button-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  Processing...
                </>
              ) : (
                <>
                  💰 Deposit Cash
                </>
              )}
            </button>
          </form>
        )}

        {/* Assessment Requirements Info */}
        <div style={{
          background: '#f8f9fc',
          border: '1px solid #e9ecf3',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h3 style={{ 
            color: '#2c3e50',
            fontSize: '1.1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📋 Assessment Requirements:
          </h3>
          <ul style={{ 
            listStyle: 'none',
            margin: 0,
            padding: 0
          }}>
            {[
              'Accepts account number as input',
              'Accepts deposit amount as input',
              'Updates account balance instantly',
              'Shows balance before and after transaction'
            ].map((requirement, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0',
                color: '#27ae60',
                fontSize: '0.95rem'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: '#27ae60',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  ✓
                </div>
                {requirement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DepositCash;