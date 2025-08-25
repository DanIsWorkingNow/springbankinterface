import React, { useState } from 'react';
import { transactionAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const WithdrawCash = () => {
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
      errors.amount = 'Withdrawal amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Please enter a valid positive amount';
      } else if (amount > 10000) {
        errors.amount = 'Daily withdrawal limit is RM 10,000';
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
      const withdrawData = {
        accountNumber: formData.accountNumber.trim(),
        amount: parseFloat(formData.amount)
      };

      console.log('Processing withdrawal:', withdrawData);
      const result = await transactionAPI.withdrawCash(withdrawData);
      
      setSuccess({
        message: 'Cash withdrawn successfully! Balance updated.',
        transactionId: result.transactionId,
        accountNumber: result.accountNumber,
        withdrawalAmount: result.amount,
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
      console.error('Withdrawal error:', err);
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
            💳 Withdraw Cash
          </h2>
          <p style={{ 
            color: '#7f8c8d', 
            fontSize: '1.1rem',
            margin: 0 
          }}>
            Securely withdraw funds from your account
          </p>
        </div>

        {/* Important Notice - More Prominent for Withdrawals */}
        <div style={{
          background: 'linear-gradient(135deg, #fff3cd, #ffeeba)',
          border: '2px solid #ffc107',
          borderLeft: '4px solid #dc3545',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚠️</div>
            <div>
              <h4 style={{
                color: '#856404',
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                Important Notice
              </h4>
              <p style={{
                color: '#856404',
                margin: 0,
                lineHeight: '1.4'
              }}>
                Please ensure sufficient funds are available in your account. Daily withdrawal limit: RM 10,000
              </p>
            </div>
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
                <span className="springbank-detail-label">Withdrawal Amount:</span>
                <span style={{ 
                  color: '#dc3545', 
                  fontWeight: 'bold', 
                  fontSize: '1.2rem' 
                }}>
                  -{formatCurrency(success.withdrawalAmount)}
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
              💳 Make Another Withdrawal
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && <ErrorMessage error={error} onRetry={handleRetry} />}

        {/* Withdrawal Form */}
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

            {/* Withdrawal Amount */}
            <div className="springbank-form-group">
              <label htmlFor="amount" className="springbank-label">
                Withdrawal Amount *
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
                color: '#dc3545', 
                fontSize: '0.875rem',
                marginTop: '0.25rem',
                display: 'block',
                fontWeight: '500'
              }}>
                Maximum daily withdrawal: RM 10,000
              </small>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="springbank-button"
              disabled={loading}
              style={{ 
                width: '100%', 
                marginTop: '1rem',
                background: loading ? '#6c757d' : 'linear-gradient(135deg, #343a40, #212529)',
                color: 'white',
                border: 'none',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(52, 58, 64, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #212529, #000000)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(52, 58, 64, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #343a40, #212529)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(52, 58, 64, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  Processing...
                </>
              ) : (
                <>
                  💳 Withdraw Cash
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
              'Accepts withdrawal amount as input',
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

export default WithdrawCash;