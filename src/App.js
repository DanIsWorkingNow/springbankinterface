// src/App.js - Improved Design with Centered Header & Footer
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

import './App.css';

/**
 * SpringBank Application - Improved Design with Centered Layout
 */
const App = () => {
  const [activeService, setActiveService] = useState('inquire-customer');
  const [serverStatus, setServerStatus] = useState('connecting');

  // Check backend connectivity
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

  // This function returns your actual components
  const renderServiceContent = () => {
    switch (activeService) {
      // ✅ CUSTOMER MANAGEMENT
      case 'create-customer':
        return <CreateCustomer />;
        
      case 'inquire-customer':
        return <InquireCustomer />;

      // ✅ ACCOUNT MANAGEMENT
      case 'create-account':
        return <CreateAccount />; 
        
      case 'inquire-account':
        return <InquireAccount />;
        
      case 'close-account':
        return <CloseAccount />;

      // ✅ TRANSACTION MANAGEMENT
      case 'deposit-cash':
        return <DepositCash />;
        
      case 'withdraw-cash':
        return <WithdrawCash />;
        
      // ✅ BONUS FEATURE
      case 'transaction-history':
        return <TransactionHistory />;

      default:
        return <InquireCustomer />;
    }
  };

  return (
    <div className="springbank-app">
      {/* Modern Centered Header */}
      <header className="springbank-header-main">
        <div className="springbank-header-content">
          <div className="springbank-brand-section">
            <h1 className="springbank-app-title">🏦 SpringBank</h1>
            <p className="springbank-app-subtitle">Complete Banking Management System</p>
          </div>
          
          {/* Backend Status Indicator */}
          <div className="springbank-status-section">
            <span className={`springbank-server-status springbank-status-${serverStatus}`}>
              {serverStatus === 'connected' ? '🟢 BACKEND CONNECTED' : 
               serverStatus === 'disconnected' ? '🔴 BACKEND DISCONNECTED' : 
               '🟡 CONNECTING...'}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation with Your Existing Structure */}
      <nav className="springbank-nav">
        <div className="springbank-nav-container">
          <div className="springbank-nav-menu">
            {/* Customer Management */}
            <button
              className={`springbank-nav-button ${activeService === 'create-customer' ? 'active' : ''}`}
              onClick={() => setActiveService('create-customer')}
            >
              <span className="springbank-nav-icon">👤</span>
              Create Customer
            </button>
            
            <button
              className={`springbank-nav-button ${activeService === 'inquire-customer' ? 'active' : ''}`}
              onClick={() => setActiveService('inquire-customer')}
            >
              <span className="springbank-nav-icon">🔍</span>
              Inquire Customer
            </button>

            {/* Account Management */}
            <button
              className={`springbank-nav-button ${activeService === 'create-account' ? 'active' : ''}`}
              onClick={() => setActiveService('create-account')}
            >
              <span className="springbank-nav-icon">🏦</span>
              Create Account
            </button>
            
            <button
              className={`springbank-nav-button ${activeService === 'inquire-account' ? 'active' : ''}`}
              onClick={() => setActiveService('inquire-account')}
            >
              <span className="springbank-nav-icon">📊</span>
              Inquire Account
            </button>
            
            <button
              className={`springbank-nav-button ${activeService === 'close-account' ? 'active' : ''}`}
              onClick={() => setActiveService('close-account')}
            >
              <span className="springbank-nav-icon">🔒</span>
              Close Account
            </button>

            {/* Transaction Management */}
            <button
              className={`springbank-nav-button ${activeService === 'deposit-cash' ? 'active' : ''}`}
              onClick={() => setActiveService('deposit-cash')}
            >
              <span className="springbank-nav-icon">💰</span>
              Deposit Cash
            </button>
            
            <button
              className={`springbank-nav-button ${activeService === 'withdraw-cash' ? 'active' : ''}`}
              onClick={() => setActiveService('withdraw-cash')}
            >
              <span className="springbank-nav-icon">💸</span>
              Withdraw Cash
            </button>

            {/* Bonus Feature */}
            <button
              className={`springbank-nav-button ${activeService === 'transaction-history' ? 'active' : ''}`}
              onClick={() => setActiveService('transaction-history')}
            >
              <span className="springbank-nav-icon">📊</span>
              Transaction History
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="springbank-main">
        {renderServiceContent()}
      </main>

      {/* Centered Professional Footer */}
      <footer className="springbank-footer">
        <div className="springbank-footer-content">
          <p className="springbank-footer-text">© 2025 SpringBank Application - Assessment Complete</p>
          <p className="springbank-footer-subtext">Professional Banking Management System | Full-Stack Development Portfolio</p>
        </div>
      </footer>
    </div>
  );
};

export default App;