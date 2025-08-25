import React, { useState } from 'react';
import { transactionAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './DepositCash.css';

const DepositCash = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Account number validation
    if (!formData.accountNumber.trim()) {
      errors.accountNumber = 'Account number is required';
    } else if (formData.accountNumber.trim().length < 3) {
      errors.accountNumber = 'Please enter a valid account number';
    }
    
    // Amount validation
    if (!formData.amount) {
      errors.amount = 'Deposit amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Please enter a valid amount greater than 0';
      } else if (amount > 1000000) {
        errors.amount = 'Maximum deposit amount is $1,000,000';
      } else if (amount < 0.01) {
        errors.amount = 'Minimum deposit amount is $0.01';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call your existing API service
      const result = await transactionAPI.depositCash({
        accountNumber: formData.accountNumber.trim(),
        amount: parseFloat(formData.amount),
        description: formData.description.trim() || 'Cash deposit'
      });
      
      setSuccess({
        message: 'Deposit processed successfully!',
        data: result
      });
      
      // Clear form after successful deposit
      setFormData({
        accountNumber: '',
        amount: '',
        description: ''
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
  };

  if (loading) {
    return <LoadingSpinner message="Processing your deposit..." />;
  }

  return (
    <div className="deposit-cash">
      <div className="deposit-header">
        <h2>💰 Deposit Cash</h2>
        <p>Add funds to your account quickly and securely</p>
      </div>
      
      {error && <ErrorMessage error={error} onRetry={handleRetry} />}
      
      {success && (
        <div className="success-message">
          <h3>✅ Deposit Successful!</h3>
          <p>{success.message}</p>
          <div className="transaction-details">
            <div className="detail-row">
              <span>Transaction ID:</span>
              <span>{success.data.transactionId || success.data.id || 'Generated'}</span>
            </div>
            <div className="detail-row">
              <span>Account Number:</span>
              <span>{success.data.accountNumber}</span>
            </div>
            <div className="detail-row">
              <span>Amount Deposited:</span>
              <span className="amount">${parseFloat(success.data.amount).toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span>New Balance:</span>
              <span className="balance">${parseFloat(success.data.balanceAfter || success.data.balance || 0).toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span>Date & Time:</span>
              <span>
                {success.data.transactionDate 
                  ? new Date(success.data.transactionDate).toLocaleString()
                  : new Date().toLocaleString()
                }
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="deposit-form">
        <div className="form-group">
          <label htmlFor="accountNumber">Account Number *</label>
          <input
            id="accountNumber"
            name="accountNumber"
            type="text"
            value={formData.accountNumber}
            onChange={handleInputChange}
            className={formErrors.accountNumber ? 'error' : ''}
            placeholder="Enter account number"
            disabled={loading}
          />
          {formErrors.accountNumber && (
            <span className="error-text">{formErrors.accountNumber}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="amount">Deposit Amount *</label>
          <div className="amount-input-container">
            <span className="currency-symbol">$</span>
            <input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              className={formErrors.amount ? 'error' : ''}
              placeholder="0.00"
              min="0.01"
              max="1000000"
              step="0.01"
              disabled={loading}
            />
          </div>
          {formErrors.amount && (
            <span className="error-text">{formErrors.amount}</span>
          )}
          <small className="help-text">Minimum: $0.01 | Maximum: $1,000,000</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <input
            id="description"
            name="description"
            type="text"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., Salary deposit, Cash deposit, etc."
            maxLength="100"
            disabled={loading}
          />
          <small className="help-text">Optional description for your records</small>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="deposit-button"
            disabled={loading || !formData.accountNumber || !formData.amount}
          >
            <span className="button-icon">💰</span>
            {loading ? 'Processing...' : 'Process Deposit'}
          </button>
        </div>
      </form>

      <div className="deposit-info">
        <h4>Important Information:</h4>
        <ul>
          <li>Deposits are processed immediately and reflected in your account balance</li>
          <li>All transactions are recorded and can be viewed in transaction history</li>
          <li>For deposits over $10,000, additional verification may be required</li>
          <li>Transaction fees may apply for certain account types</li>
        </ul>
      </div>
    </div>
  );
};

export default DepositCash;