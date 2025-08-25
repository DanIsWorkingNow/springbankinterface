// src/App.js
import React, { useState, useEffect } from 'react';
import { customerAPI, accountAPI, transactionAPI, checkServerConnection, formatCurrency, formatDate } from './services/api';

// Import your existing components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';

import './App.css';

function App() {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  // Navigation and UI state
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [serverStatus, setServerStatus] = useState({ connected: false, message: 'Checking connection...' });

  // Data state
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // Selected items state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [accountForm, setAccountForm] = useState({
    customerId: '',
    accountType: 'SAVINGS'
  });

  const [transactionForm, setTransactionForm] = useState({
    accountNumber: '',
    amount: ''
  });

  const [inquiryForm, setInquiryForm] = useState({
    customerId: '',
    accountNumber: ''
  });

  // ========================================
  // LIFECYCLE METHODS
  // ========================================
  
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await checkConnection();
    await loadInitialData();
  };

  const checkConnection = async () => {
    setLoading(true);
    try {
      const status = await checkServerConnection();
      setServerStatus(status);
      
      if (status.connected) {
        showMessage('success', `Connected to SpringBank backend! (${status.customerCount} customers in database)`);
      } else {
        showMessage('error', `Connection failed: ${status.message}`);
      }
    } catch (error) {
      setServerStatus({ 
        connected: false, 
        message: 'Connection check failed' 
      });
      showMessage('error', 'Failed to check server connection');
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    if (serverStatus.connected) {
      try {
        const [customersData, recentTransactionsData] = await Promise.all([
          customerAPI.getAllCustomers(),
          transactionAPI.getRecentTransactions(5)
        ]);
        
        setCustomers(customersData);
        setRecentTransactions(recentTransactionsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    }
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const showMessage = (type, text, duration = 5000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), duration);
  };

  const resetForms = () => {
    setCustomerForm({ name: '', email: '', phone: '' });
    setAccountForm({ customerId: '', accountType: 'SAVINGS' });
    setTransactionForm({ accountNumber: '', amount: '' });
    setInquiryForm({ customerId: '', accountNumber: '' });
  };

  // ========================================
  // CUSTOMER MANAGEMENT FUNCTIONS
  // Assessment Requirements 1 & 2
  // ========================================

  /**
   * CREATE CUSTOMER - Assessment Requirement 1
   */
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    
    if (!customerForm.name.trim()) {
      showMessage('error', 'Customer name is required');
      return;
    }

    setLoading(true);
    try {
      const newCustomer = await customerAPI.createCustomer(customerForm);
      
      // Update customers list
      setCustomers(prev => [...prev, newCustomer]);
      
      // Reset form
      setCustomerForm({ name: '', email: '', phone: '' });
      
      showMessage('success', `Customer created successfully! 
        ID: ${newCustomer.id} | Name: ${newCustomer.name}`);
        
    } catch (error) {
      showMessage('error', error.userMessage || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  /**
   * INQUIRE CUSTOMER - Assessment Requirement 2
   */
  const handleInquireCustomer = async (e) => {
    e.preventDefault();
    
    if (!inquiryForm.customerId) {
      showMessage('error', 'Customer ID is required');
      return;
    }

    setLoading(true);
    try {
      const customer = await customerAPI.getCustomerById(inquiryForm.customerId);
      setSelectedCustomer(customer);
      
      // Also load customer's accounts
      try {
        const customerAccounts = await accountAPI.getAccountsByCustomer(inquiryForm.customerId);
        setAccounts(customerAccounts);
      } catch (accountError) {
        setAccounts([]);
        console.log('No accounts found for customer or error loading accounts');
      }
      
      showMessage('success', `Customer found: ${customer.name} (ID: ${customer.id})`);
      
    } catch (error) {
      setSelectedCustomer(null);
      setAccounts([]);
      
      if (error.response?.status === 404) {
        showMessage('error', `Customer with ID ${inquiryForm.customerId} not found`);
      } else {
        showMessage('error', error.userMessage || 'Failed to fetch customer');
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // ACCOUNT MANAGEMENT FUNCTIONS  
  // Assessment Requirements 3, 6 & 7
  // ========================================

  /**
   * CREATE ACCOUNT - Assessment Requirement 3
   */
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    
    if (!accountForm.customerId || !accountForm.accountType) {
      showMessage('error', 'Customer ID and Account Type are required');
      return;
    }

    setLoading(true);
    try {
      const newAccount = await accountAPI.createAccount({
        customerId: parseInt(accountForm.customerId),
        accountType: accountForm.accountType
      });
      
      // Update accounts list
      setAccounts(prev => [...prev, newAccount]);
      
      // Reset form
      setAccountForm({ customerId: '', accountType: 'SAVINGS' });
      
      showMessage('success', `Account created successfully! 
        Account Number: ${newAccount.accountNumber} | Status: ${newAccount.status}`);
        
    } catch (error) {
      if (error.response?.status === 404) {
        showMessage('error', `Customer with ID ${accountForm.customerId} not found`);
      } else {
        showMessage('error', error.userMessage || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * INQUIRE ACCOUNT - Assessment Requirement 7
   */
  const handleInquireAccount = async (e) => {
    e.preventDefault();
    
    if (!inquiryForm.accountNumber) {
      showMessage('error', 'Account number is required');
      return;
    }

    setLoading(true);
    try {
      const account = await accountAPI.getAccountByNumber(inquiryForm.accountNumber);
      setSelectedAccount(account);
      
      // Also load transaction history
      try {
        const history = await transactionAPI.getTransactionHistory(inquiryForm.accountNumber);
        setTransactions(history);
      } catch (transError) {
        setTransactions([]);
        console.log('No transactions found for account or error loading transactions');
      }
      
      showMessage('success', `Account found: ${account.accountNumber} | 
        Holder: ${account.customerName} | Status: ${account.status} | 
        Balance: ${formatCurrency(account.balance)}`);
        
    } catch (error) {
      setSelectedAccount(null);
      setTransactions([]);
      
      if (error.response?.status === 404) {
        showMessage('error', `Account ${inquiryForm.accountNumber} not found`);
      } else {
        showMessage('error', error.userMessage || 'Failed to fetch account');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * CLOSE ACCOUNT - Assessment Requirement 6
   */
  const handleCloseAccount = async (accountNumber) => {
    if (!window.confirm(`Are you sure you want to close account ${accountNumber}?`)) {
      return;
    }

    setLoading(true);
    try {
      const closedAccount = await accountAPI.closeAccount(accountNumber);
      
      // Update accounts list
      setAccounts(prev => prev.map(acc => 
        acc.accountNumber === accountNumber 
          ? { ...acc, status: 'CLOSED' } 
          : acc
      ));
      
      // Update selected account if it's the one being closed
      if (selectedAccount && selectedAccount.accountNumber === accountNumber) {
        setSelectedAccount({ ...selectedAccount, status: 'CLOSED' });
      }
      
      showMessage('success', `Account ${accountNumber} closed successfully. Status updated to: CLOSED`);
      
    } catch (error) {
      if (error.response?.status === 404) {
        showMessage('error', `Account ${accountNumber} not found`);
      } else if (error.response?.status === 400) {
        showMessage('error', 'Account cannot be closed (may already be closed)');
      } else {
        showMessage('error', error.userMessage || 'Failed to close account');
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // TRANSACTION MANAGEMENT FUNCTIONS
  // Assessment Requirements 4 & 5
  // ========================================

  /**
   * DEPOSIT CASH - Assessment Requirement 4
   */
  const handleDeposit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(transactionForm.amount);
    
    if (!transactionForm.accountNumber || !amount || amount <= 0) {
      showMessage('error', 'Valid account number and positive amount are required');
      return;
    }

    setLoading(true);
    try {
      const transaction = await transactionAPI.depositCash({
        accountNumber: transactionForm.accountNumber,
        amount: amount
      });
      
      // Update transactions list
      setTransactions(prev => [transaction, ...prev]);
      setRecentTransactions(prev => [transaction, ...prev.slice(0, 4)]);
      
      // Update selected account balance if it matches
      if (selectedAccount && selectedAccount.accountNumber === transactionForm.accountNumber) {
        setSelectedAccount({ ...selectedAccount, balance: transaction.balanceAfter });
      }
      
      // Reset transaction form
      setTransactionForm({ accountNumber: '', amount: '' });
      
      showMessage('success', `Deposit successful! 
        Amount: ${formatCurrency(transaction.amount)} | 
        New Balance: ${formatCurrency(transaction.balanceAfter)}`);
        
    } catch (error) {
      if (error.response?.status === 404) {
        showMessage('error', `Account ${transactionForm.accountNumber} not found`);
      } else if (error.response?.status === 400) {
        showMessage('error', 'Invalid deposit request (account may be inactive)');
      } else {
        showMessage('error', error.userMessage || 'Deposit failed');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * WITHDRAW CASH - Assessment Requirement 5
   */
  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(transactionForm.amount);
    
    if (!transactionForm.accountNumber || !amount || amount <= 0) {
      showMessage('error', 'Valid account number and positive amount are required');
      return;
    }

    setLoading(true);
    try {
      const transaction = await transactionAPI.withdrawCash({
        accountNumber: transactionForm.accountNumber,
        amount: amount
      });
      
      // Update transactions list
      setTransactions(prev => [transaction, ...prev]);
      setRecentTransactions(prev => [transaction, ...prev.slice(0, 4)]);
      
      // Update selected account balance if it matches
      if (selectedAccount && selectedAccount.accountNumber === transactionForm.accountNumber) {
        setSelectedAccount({ ...selectedAccount, balance: transaction.balanceAfter });
      }
      
      // Reset transaction form
      setTransactionForm({ accountNumber: '', amount: '' });
      
      showMessage('success', `Withdrawal successful! 
        Amount: ${formatCurrency(transaction.amount)} | 
        New Balance: ${formatCurrency(transaction.balanceAfter)}`);
        
    } catch (error) {
      if (error.response?.status === 404) {
        showMessage('error', `Account ${transactionForm.accountNumber} not found`);
      } else if (error.response?.status === 400) {
        // This could be insufficient funds or inactive account
        const errorMsg = error.response?.data?.message || error.userMessage;
        if (errorMsg.toLowerCase().includes('insufficient')) {
          showMessage('error', `Insufficient funds. Please check account balance.`);
        } else {
          showMessage('error', 'Invalid withdrawal request (account may be inactive)');
        }
      } else {
        showMessage('error', error.userMessage || 'Withdrawal failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderNavigation = () => (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>🏦 SpringBank</h1>
          <span className={`server-status ${serverStatus.connected ? 'connected' : 'disconnected'}`}>
            {serverStatus.connected ? '● Online' : '● Offline'}
          </span>
        </div>
        
        <div className="nav-menu">
          {[
            { key: 'dashboard', label: '📊 Dashboard' },
            { key: 'customer', label: '👥 Customers' },
            { key: 'account', label: '🏦 Accounts' },
            { key: 'transaction', label: '💰 Transactions' }
          ].map(item => (
            <button 
              key={item.key}
              className={`nav-btn ${currentView === item.key ? 'active' : ''}`}
              onClick={() => setCurrentView(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="nav-actions">
          <button 
            className="connection-btn"
            onClick={checkConnection}
            disabled={loading}
          >
            🔄 Test Connection
          </button>
        </div>
      </div>
    </nav>
  );

  const renderDashboard = () => (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>SpringBank Dashboard</h2>
        <p>Complete Banking Management System</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card customers">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Customers</h3>
            <p className="stat-number">{customers.length}</p>
            <small>Registered customers in system</small>
          </div>
        </div>
        
        <div className="stat-card accounts">
          <div className="stat-icon">🏦</div>
          <div className="stat-content">
            <h3>Active Accounts</h3>
            <p className="stat-number">{accounts.filter(acc => acc.status === 'ACTIVE').length}</p>
            <small>Currently active accounts</small>
          </div>
        </div>
        
        <div className="stat-card transactions">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Recent Transactions</h3>
            <p className="stat-number">{recentTransactions.length}</p>
            <small>Latest transaction activity</small>
          </div>
        </div>
        
        <div className="stat-card status">
          <div className="stat-icon">{serverStatus.connected ? '✅' : '❌'}</div>
          <div className="stat-content">
            <h3>Server Status</h3>
            <p className={`stat-status ${serverStatus.connected ? 'online' : 'offline'}`}>
              {serverStatus.connected ? 'Online' : 'Offline'}
            </p>
            <small>{serverStatus.message}</small>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button 
            className="action-btn primary"
            onClick={() => setCurrentView('customer')}
          >
            <span>👤</span>
            <div>
              <h4>Create Customer</h4>
              <p>Add new customer to system</p>
            </div>
          </button>
          
          <button 
            className="action-btn success"
            onClick={() => setCurrentView('account')}
          >
            <span>🏦</span>
            <div>
              <h4>Create Account</h4>
              <p>Open new bank account</p>
            </div>
          </button>
          
          <button 
            className="action-btn info"
            onClick={() => setCurrentView('transaction')}
          >
            <span>💰</span>
            <div>
              <h4>Make Transaction</h4>
              <p>Deposit or withdraw funds</p>
            </div>
          </button>
          
          <button 
            className="action-btn secondary"
            onClick={() => {
              setCurrentView('customer');
              // Auto-focus the inquiry form
              setTimeout(() => {
                const input = document.querySelector('input[placeholder*="Customer ID"]');
                if (input) input.focus();
              }, 100);
            }}
          >
            <span>🔍</span>
            <div>
              <h4>Inquiry Service</h4>
              <p>Search customers & accounts</p>
            </div>
          </button>
        </div>
      </div>

      {recentTransactions.length > 0 && (
        <div className="recent-activity">
          <h3>Recent Transaction Activity</h3>
          <div className="activity-list">
            {recentTransactions.map((transaction, index) => (
              <div key={transaction.id || index} className="activity-item">
                <div className={`activity-icon ${transaction.transactionType.toLowerCase()}`}>
                  {transaction.transactionType === 'DEPOSIT' ? '📈' : '📉'}
                </div>
                <div className="activity-content">
                  <h4>{transaction.transactionType}</h4>
                  <p>Account: {transaction.accountNumber}</p>
                  <small>{formatDate(transaction.transactionDate)}</small>
                </div>
                <div className="activity-amount">
                  <span className={transaction.transactionType.toLowerCase()}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCustomerManagement = () => (
    <div className="section-container">
      <div className="section-header">
        <h2>Customer Management</h2>
        <p>Create and inquire customer information</p>
      </div>

      <div className="form-grid">
        {/* Create Customer Form */}
        <div className="form-section">
          <h3>📝 Create Customer</h3>
          <form onSubmit={handleCreateCustomer}>
            <div className="form-group">
              <label>Customer Name *</label>
              <input
                type="text"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            
            <button type="submit" disabled={loading} className="submit-btn primary">
              {loading ? 'Creating...' : 'Create Customer'}
            </button>
          </form>
        </div>

        {/* Inquire Customer Form */}
        <div className="form-section">
          <h3>🔍 Inquire Customer</h3>
          <form onSubmit={handleInquireCustomer}>
            <div className="form-group">
              <label>Customer ID *</label>
              <input
                type="number"
                value={inquiryForm.customerId}
                onChange={(e) => setInquiryForm({...inquiryForm, customerId: e.target.value})}
                placeholder="Enter Customer ID"
                required
              />
            </div>
            
            <button type="submit" disabled={loading} className="submit-btn secondary">
              {loading ? 'Searching...' : 'Find Customer'}
            </button>
          </form>
        </div>
      </div>

      {/* Selected Customer Display */}
      {selectedCustomer && (
        <div className="result-section">
          <h3>Customer Details</h3>
          <div className="customer-card">
            <div className="card-header">
              <h4>{selectedCustomer.name}</h4>
              <span className="customer-id">ID: {selectedCustomer.id}</span>
            </div>
            <div className="card-content">
              <div className="detail-row">
                <strong>Email:</strong> {selectedCustomer.email || 'Not provided'}
              </div>
              <div className="detail-row">
                <strong>Phone:</strong> {selectedCustomer.phone || 'Not provided'}
              </div>
              <div className="detail-row">
                <strong>Created:</strong> {formatDate(selectedCustomer.createdDate)}
              </div>
              <div className="detail-row">
                <strong>Accounts:</strong> {accounts.length} account(s)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Customers Table */}
      <div className="table-section">
        <h3>All Customers ({customers.length})</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{formatDate(customer.createdDate)}</td>
                  <td>
                    <button
                      className="table-btn"
                      onClick={() => {
                        setInquiryForm({...inquiryForm, customerId: customer.id.toString()});
                        handleInquireCustomer({ preventDefault: () => {} });
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAccountManagement = () => (
    <div className="section-container">
      <div className="section-header">
        <h2>Account Management</h2>
        <p>Create, inquire, and close bank accounts</p>
      </div>

      <div className="form-grid">
        {/* Create Account Form */}
        <div className="form-section">
          <h3>🏦 Create Account</h3>
          <form onSubmit={handleCreateAccount}>
            <div className="form-group">
              <label>Customer ID *</label>
              <input
                type="number"
                value={accountForm.customerId}
                onChange={(e) => setAccountForm({...accountForm, customerId: e.target.value})}
                placeholder="Enter Customer ID"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Account Type *</label>
              <select
                value={accountForm.accountType}
                onChange={(e) => setAccountForm({...accountForm, accountType: e.target.value})}
                required
              >
                <option value="SAVINGS">💰 Savings Account</option>
                <option value="CURRENT">🏢 Current Account</option>
                <option value="FIXED_DEPOSIT">📈 Fixed Deposit</option>
              </select>
            </div>
            
            <button type="submit" disabled={loading} className="submit-btn success">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Inquire Account Form */}
        <div className="form-section">
          <h3>🔍 Inquire Account</h3>
          <form onSubmit={handleInquireAccount}>
            <div className="form-group">
              <label>Account Number *</label>
              <input
                type="text"
                value={inquiryForm.accountNumber}
                onChange={(e) => setInquiryForm({...inquiryForm, accountNumber: e.target.value})}
                placeholder="Enter Account Number (e.g., ACC1234567890123)"
                required
              />
            </div>
            
            <button type="submit" disabled={loading} className="submit-btn secondary">
              {loading ? 'Searching...' : 'Find Account'}
            </button>
          </form>
        </div>
      </div>

      {/* Selected Account Display */}
      {selectedAccount && (
        <div className="result-section">
          <h3>Account Details</h3>
          <div className="account-card">
            <div className="card-header">
              <h4>{selectedAccount.accountNumber}</h4>
              <span className={`status-badge ${selectedAccount.status.toLowerCase()}`}>
                {selectedAccount.status}
              </span>
            </div>
            <div className="card-content">
              <div className="account-info">
                <div className="info-section">
                  <h5>Account Holder Information</h5>
                  <div className="detail-row">
                    <strong>Name:</strong> {selectedAccount.customerName}
                  </div>
                  <div className="detail-row">
                    <strong>Customer ID:</strong> {selectedAccount.customerId}
                  </div>
                  <div className="detail-row">
                    <strong>Email:</strong> {selectedAccount.customerEmail || 'Not provided'}
                  </div>
                  <div className="detail-row">
                    <strong>Phone:</strong> {selectedAccount.customerPhone || 'Not provided'}
                  </div>
                </div>
                
                <div className="info-section">
                  <h5>Account Information</h5>
                  <div className="detail-row">
                    <strong>Type:</strong> {selectedAccount.accountType}
                  </div>
                  <div className="detail-row">
                    <strong>Balance:</strong> <span className="balance">{formatCurrency(selectedAccount.balance)}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Status:</strong> {selectedAccount.status}
                  </div>
                  <div className="detail-row">
                    <strong>Created:</strong> {formatDate(selectedAccount.createdDate)}
                  </div>
                </div>
              </div>
              
              {selectedAccount.status === 'ACTIVE' && (
                <div className="account-actions">
                  <button 
                    onClick={() => handleCloseAccount(selectedAccount.accountNumber)}
                    className="close-btn"
                    disabled={loading}
                  >
                    {loading ? 'Closing...' : 'Close Account'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Accounts Display */}
      {accounts.length > 0 && (
        <div className="table-section">
          <h3>Customer Accounts ({accounts.length})</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(account => (
                  <tr key={account.accountNumber}>
                    <td className="account-number">{account.accountNumber}</td>
                    <td>{account.customerName}</td>
                    <td>{account.accountType}</td>
                    <td className="balance">{formatCurrency(account.balance)}</td>
                    <td>
                      <span className={`status-badge ${account.status.toLowerCase()}`}>
                        {account.status}
                      </span>
                    </td>
                    <td>{formatDate(account.createdDate)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="table-btn"
                          onClick={() => {
                            setInquiryForm({...inquiryForm, accountNumber: account.accountNumber});
                            handleInquireAccount({ preventDefault: () => {} });
                          }}
                        >
                          View
                        </button>
                        {account.status === 'ACTIVE' && (
                          <button
                            className="table-btn close"
                            onClick={() => handleCloseAccount(account.accountNumber)}
                            disabled={loading}
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderTransactionManagement = () => (
    <div className="section-container">
      <div className="section-header">
        <h2>Transaction Management</h2>
        <p>Deposit and withdraw funds from accounts</p>
      </div>

      <div className="transaction-forms">
        {/* Deposit Form */}
        <div className="form-section deposit-section">
          <h3>📈 Deposit Cash</h3>
          <form onSubmit={handleDeposit}>
            <div className="form-group">
              <label>Account Number *</label>
              <input
                type="text"
                value={transactionForm.accountNumber}
                onChange={(e) => setTransactionForm({...transactionForm, accountNumber: e.target.value})}
                placeholder="Enter Account Number"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Deposit Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
            
            <button type="submit" disabled={loading} className="submit-btn success">
              {loading ? 'Processing...' : 'Deposit Cash'}
            </button>
          </form>
        </div>

        {/* Withdraw Form */}
        <div className="form-section withdraw-section">
          <h3>📉 Withdraw Cash</h3>
          <form onSubmit={handleWithdraw}>
            <div className="form-group">
              <label>Account Number *</label>
              <input
                type="text"
                value={transactionForm.accountNumber}
                onChange={(e) => setTransactionForm({...transactionForm, accountNumber: e.target.value})}
                placeholder="Enter Account Number"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Withdrawal Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
            
            <button type="submit" disabled={loading} className="submit-btn danger">
              {loading ? 'Processing...' : 'Withdraw Cash'}
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div className="table-section">
          <h3>Transaction History ({transactions.length})</h3>
          <div className="table-container">
            <table className="data-table transactions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Account Number</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td className="account-number">{transaction.accountNumber}</td>
                    <td>
                      <span className={`transaction-type ${transaction.transactionType.toLowerCase()}`}>
                        {transaction.transactionType === 'DEPOSIT' ? '📈' : '📉'} {transaction.transactionType}
                      </span>
                    </td>
                    <td className={`amount ${transaction.transactionType.toLowerCase()}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="balance">{formatCurrency(transaction.balanceAfter)}</td>
                    <td>{formatDate(transaction.transactionDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="app">
      <Header />
      
      {renderNavigation()}
      
      {/* Global Message Display */}
      {message.text && (
        <div className={`global-message ${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          {message.text}
          <button 
            className="message-close"
            onClick={() => setMessage({ type: '', text: '' })}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Main Content */}
      <main className="main-content">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'customer' && renderCustomerManagement()}
        {currentView === 'account' && renderAccountManagement()}
        {currentView === 'transaction' && renderTransactionManagement()}
      </main>
      
      {/* Global Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <LoadingSpinner message="Processing your request..." />
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default App;