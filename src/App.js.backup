// src/App.js - Uses Your EXISTING Styling (No Changes to Design)
import React, { useState, useEffect } from 'react';

// CUSTOMER COMPONENTS (Working)
import CreateCustomer from './components/customer/CreateCustomer';
import InquireCustomer from './components/customer/InquireCustomer';

// ACCOUNT COMPONENTS (All Created)
import CreateAccount from './components/account/CreateAccount';
import InquireAccount from './components/account/InquireAccount';
import CloseAccount from './components/account/CloseAccount';

// TRANSACTION COMPONENTS (All Created)  
import DepositCash from './components/transaction/DepositCash';
import WithdrawCash from './components/transaction/WithdrawCash';
import TransactionHistory from './components/transaction/TransactionHistory';

import './App.css'; // Keep your existing CSS file unchanged

/**
 * SpringBank Application - Uses Your Original Styling
 * Only adds component routing, keeps all your existing design
 */
const App = () => {
  const [activeService, setActiveService] = useState('inquire-customer');
  const [serverStatus, setServerStatus] = useState('connecting');

  // Check backend connectivity (optional - remove if you don't want this)
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/customers/count');
        setServerStatus(response.ok ? 'connected' : 'error');
      } catch (error) {
        setServerStatus('disconnected');
      }
    };

    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // This function returns your actual components instead of placeholder content
  const renderServiceContent = () => {
    switch (activeService) {
      // ✅ CUSTOMER MANAGEMENT - Your working components
      case 'create-customer':
        return <CreateCustomer />;
        
      case 'inquire-customer':
        return <InquireCustomer />;

      // ✅ ACCOUNT MANAGEMENT - Your created components  
      case 'create-account':
        return <CreateAccount />; // 
        
      case 'inquire-account':
        return <InquireAccount />;
        
      case 'close-account':
        return <CloseAccount />;

      // ✅ TRANSACTION MANAGEMENT - Your created components
      case 'deposit-cash':
        return <DepositCash />;
        
      case 'withdraw-cash':
        return <WithdrawCash />;
        
      // ✅ BONUS FEATURE
      case 'transaction-history':
        return <TransactionHistory />;

      // Keep your original placeholder structure for any missing ones
      case 'inquire-account-old':
        return (
          <div className="springbank-container">
            <div className="springbank-header">
              <h2 className="springbank-title">🔍 Inquire Account</h2>
              <p className="springbank-subtitle">
                View account details including holder information and balance
              </p>
            </div>
            
            <div className="springbank-card">
              <div className="springbank-info-section">
                <h4 className="springbank-info-title">✅ Features Ready:</h4>
                <ul className="springbank-info-list">
                  <li>Account number search functionality</li>
                  <li>Complete account information display</li>
                  <li>Customer details integration</li>
                  <li>Professional card-based layout</li>
                  <li>Account status and balance information</li>
                </ul>
              </div>

              <div className="springbank-text-center springbank-mt-2">
                <button 
                  className="springbank-button springbank-button-info"
                  onClick={() => setActiveService('inquire-customer')}
                >
                  🔍 Go to Inquire Customer
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return <InquireCustomer />;
    }
  };

  // Keep your original App structure - just update the switch statement
  return (
    <div className="springbank-app">
      <header className="springbank-app-header">
        <div className="springbank-brand">
          <h1>🏦 SpringBank</h1>
          <p>Complete Banking Management System</p>
        </div>
        
        {/* Optional: Backend status indicator (remove if you don't want it) */}
        <div className="springbank-status">
          <span className={`springbank-status-indicator ${serverStatus}`}>
            {serverStatus === 'connected' ? '🟢' : 
             serverStatus === 'disconnected' ? '🔴' : '🟡'}
          </span>
          <span className="springbank-status-text">
            {serverStatus === 'connected' ? 'BACKEND CONNECTED' : 
             serverStatus === 'disconnected' ? 'BACKEND DISCONNECTED' : 'CONNECTING...'}
          </span>
        </div>
      </header>

      {/* Keep your existing navigation structure */}
      <nav className="springbank-nav">
        <div className="springbank-nav-tabs">
          {/* Customer Management */}
          <button
            className={`springbank-nav-tab ${activeService === 'create-customer' ? 'active' : ''}`}
            onClick={() => setActiveService('create-customer')}
          >
            <span className="springbank-nav-icon">👤</span>
            Create Customer
          </button>
          
          <button
            className={`springbank-nav-tab ${activeService === 'inquire-customer' ? 'active' : ''}`}
            onClick={() => setActiveService('inquire-customer')}
          >
            <span className="springbank-nav-icon">🔍</span>
            Inquire Customer
          </button>

          {/* Account Management */}
          <button
            className={`springbank-nav-tab ${activeService === 'create-account' ? 'active' : ''}`}
            onClick={() => setActiveService('create-account')}
          >
            <span className="springbank-nav-icon">🏦</span>
            Create Account
          </button>
          
          <button
            className={`springbank-nav-tab ${activeService === 'inquire-account' ? 'active' : ''}`}
            onClick={() => setActiveService('inquire-account')}
          >
            <span className="springbank-nav-icon">🔍</span>
            Inquire Account
          </button>
          
          <button
            className={`springbank-nav-tab ${activeService === 'close-account' ? 'active' : ''}`}
            onClick={() => setActiveService('close-account')}
          >
            <span className="springbank-nav-icon">🔒</span>
            Close Account
          </button>

          {/* Transaction Management */}
          <button
            className={`springbank-nav-tab ${activeService === 'deposit-cash' ? 'active' : ''}`}
            onClick={() => setActiveService('deposit-cash')}
          >
            <span className="springbank-nav-icon">💰</span>
            Deposit Cash
          </button>
          
          <button
            className={`springbank-nav-tab ${activeService === 'withdraw-cash' ? 'active' : ''}`}
            onClick={() => setActiveService('withdraw-cash')}
          >
            <span className="springbank-nav-icon">💸</span>
            Withdraw Cash
          </button>

          {/* Bonus Feature */}
          <button
            className={`springbank-nav-tab ${activeService === 'transaction-history' ? 'active' : ''}`}
            onClick={() => setActiveService('transaction-history')}
          >
            <span className="springbank-nav-icon">📊</span>
            Transaction History
          </button>
        </div>
      </nav>

      {/* Keep your existing main content structure */}
      <main className="springbank-main">
        {renderServiceContent()}
      </main>

      {/* Keep your existing footer */}
      <footer className="springbank-footer">
        <p>&copy; 2025 SpringBank Application - Assessment Complete</p>
      </footer>
    </div>
  );
};

export default App;