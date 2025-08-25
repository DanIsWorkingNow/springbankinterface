import React, { useState } from 'react';
import { transactionAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './TransactionHistory.css';

const TransactionHistory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [searchError, setSearchError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accountNumber.trim()) {
      setSearchError('Account number is required');
      return;
    }

    setLoading(true);
    setError(null);
    setTransactions([]);
    setSearchError('');

    try {
      const result = await transactionAPI.getTransactionHistory(accountNumber.trim());
      setTransactions(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Transaction history error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setTransactions([]);
  };

  const handleInputChange = (e) => {
    setAccountNumber(e.target.value);
    if (searchError) {
      setSearchError('');
    }
  };

  const getTransactionIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT': return '💰';
      case 'WITHDRAWAL': return '💳';
      case 'TRANSFER': return '🔄';
      default: return '📝';
    }
  };

  const getTransactionColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT': return 'transaction-deposit';
      case 'WITHDRAWAL': return 'transaction-withdrawal';
      case 'TRANSFER': return 'transaction-transfer';
      default: return 'transaction-default';
    }
  };

  const formatAmount = (amount, type) => {
    const formattedAmount = parseFloat(amount || 0).toFixed(2);
    const prefix = type?.toUpperCase() === 'WITHDRAWAL' ? '-' : '+';
    return `${prefix}$${formattedAmount}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading transaction history..." />;
  }

  return (
    <div className="transaction-history">
      <div className="history-header">
        <h2>📋 Transaction History</h2>
        <p>View your account transaction details</p>
      </div>
      
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
          </div>
        </form>
      </div>

      {error && <ErrorMessage error={error} onRetry={handleRetry} />}
      
      {transactions.length > 0 && (
        <div className="transactions-section">
          <div className="transactions-summary">
            <h3>Transaction History for Account: {accountNumber}</h3>
            <p className="summary-text">
              Found {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="transactions-list">
            {transactions.map((transaction, index) => (
              <div 
                key={transaction.id || transaction.transactionId || index} 
                className={`transaction-item ${getTransactionColor(transaction.transactionType)}`}
              >
                <div className="transaction-main">
                  <div className="transaction-icon">
                    {getTransactionIcon(transaction.transactionType)}
                  </div>
                  
                  <div className="transaction-details">
                    <h4 className="transaction-type">
                      {transaction.transactionType || 'Transaction'}
                    </h4>
                    <p className="transaction-description">
                      {transaction.description || 'No description provided'}
                    </p>
                    <p className="transaction-date">
                      {formatDate(transaction.transactionDate || transaction.createdDate)}
                    </p>
                  </div>
                  
                  <div className="transaction-amount">
                    <span className={`amount-value ${getTransactionColor(transaction.transactionType)}`}>
                      {formatAmount(transaction.amount, transaction.transactionType)}
                    </span>
                    <p className="balance-after">
                      Balance: ${parseFloat(transaction.balanceAfter || transaction.balance || 0).toFixed(2)}
                    </p>
                    {transaction.transactionId && (
                      <p className="transaction-id">
                        ID: {transaction.transactionId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {transactions.length === 0 && !loading && !error && accountNumber && (
        <div className="no-transactions">
          <div className="no-transactions-icon">📭</div>
          <h3>No Transactions Found</h3>
          <p>No transaction history available for account: <strong>{accountNumber}</strong></p>
          <p>This could mean:</p>
          <ul>
            <li>The account has no transaction history yet</li>
            <li>The account number might be incorrect</li>
            <li>The account might not exist in our system</li>
          </ul>
        </div>
      )}

      {!accountNumber && !loading && transactions.length === 0 && !error && (
        <div className="welcome-message">
          <div className="welcome-icon">🏦</div>
          <h3>Transaction History Lookup</h3>
          <p>Enter an account number above to view transaction history</p>
          <div className="features-list">
            <h4>What you can view:</h4>
            <ul>
              <li>✅ All deposits and withdrawals</li>
              <li>✅ Transaction dates and descriptions</li>
              <li>✅ Balance after each transaction</li>
              <li>✅ Transaction IDs for reference</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;