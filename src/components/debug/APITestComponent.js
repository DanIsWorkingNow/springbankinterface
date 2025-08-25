// src/components/debug/APITestComponent.js
import React, { useState, useEffect } from 'react';
import { customerAPI, accountAPI, transactionAPI, checkServerConnection, testAPIConnection, debugAPI } from '../../services/api';

/**
 * API Testing Component
 * Use this to debug and test your backend API connection
 * Add this component to your App.js temporarily to test the API
 */
const APITestComponent = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('unknown');

  useEffect(() => {
    // Auto-test server connection on load
    testServerConnection();
    
    // Log available API methods
    debugAPI.logAvailableMethods();
  }, []);

  const testServerConnection = async () => {
    try {
      const isConnected = await checkServerConnection();
      setServerStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      setServerStatus('error');
    }
  };

  const runFullAPITest = async () => {
    setLoading(true);
    try {
      console.log('🧪 Starting Full API Test...');
      
      const results = {
        server: { status: 'testing', message: '', data: null },
        customers: { status: 'testing', message: '', data: null },
        accounts: { status: 'testing', message: '', data: null },
        transactions: { status: 'testing', message: '', data: null }
      };

      setTestResults({ ...results });

      // Test 1: Server Health
      try {
        const serverOK = await checkServerConnection();
        results.server = {
          status: serverOK ? 'success' : 'failed',
          message: serverOK ? 'Server is running' : 'Server is not responding',
          data: serverOK
        };
      } catch (error) {
        results.server = { status: 'error', message: error.message, data: null };
      }

      setTestResults({ ...results });

      // Test 2: Customers API
      try {
        const customers = await customerAPI.getAll();
        results.customers = {
          status: 'success',
          message: `Found ${customers.length} customers`,
          data: customers.slice(0, 3) // Show first 3 customers
        };
      } catch (error) {
        results.customers = { status: 'error', message: error.message, data: null };
      }

      setTestResults({ ...results });

      // Test 3: Accounts API
      try {
        const accounts = await accountAPI.getAll();
        results.accounts = {
          status: 'success',
          message: `Found ${accounts.length} accounts`,
          data: accounts.slice(0, 3) // Show first 3 accounts
        };
      } catch (error) {
        results.accounts = { status: 'error', message: error.message, data: null };
      }

      setTestResults({ ...results });

      // Test 4: Transactions API
      try {
        const transactions = await transactionAPI.getAll();
        results.transactions = {
          status: 'success',
          message: `Found ${transactions.length} transactions`,
          data: transactions.slice(0, 3) // Show first 3 transactions
        };
      } catch (error) {
        results.transactions = { status: 'error', message: error.message, data: null };
      }

      setTestResults({ ...results });

    } catch (error) {
      console.error('Full API test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCustomerCreation = async () => {
    try {
      const testCustomer = {
        name: 'API Test Customer',
        email: 'test@apitest.com',
        phone: '123-456-7890'
      };

      console.log('🧪 Testing Customer Creation...');
      const result = await customerAPI.create(testCustomer);
      console.log('✅ Customer created successfully:', result);
      
      alert(`Customer created successfully! ID: ${result.id}, Name: ${result.name}`);
      
      // Refresh the full test
      runFullAPITest();
    } catch (error) {
      console.error('❌ Customer creation failed:', error);
      alert(`Customer creation failed: ${error.message}`);
    }
  };

  const testCustomerInquiry = async () => {
    try {
      console.log('🧪 Testing Customer Inquiry...');
      const result = await customerAPI.getById(1);
      console.log('✅ Customer inquiry successful:', result);
      
      alert(`Customer found! ID: ${result.id}, Name: ${result.name}`);
    } catch (error) {
      console.error('❌ Customer inquiry failed:', error);
      alert(`Customer inquiry failed: ${error.message}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'failed': return '❌';
      case 'testing': return '⏳';
      default: return '⚪';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'failed': return '#dc3545';
      case 'testing': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔧 API Connection Tester</h2>
        <p style={styles.subtitle}>Debug your SpringBank backend connection</p>
      </div>

      {/* Server Status */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Server Status</h3>
        <div style={styles.statusRow}>
          <span>Backend Server:</span>
          <span style={{ 
            color: serverStatus === 'connected' ? '#28a745' : '#dc3545',
            fontWeight: 'bold' 
          }}>
            {serverStatus === 'connected' ? '🟢 CONNECTED' : '🔴 DISCONNECTED'}
          </span>
        </div>
        <button 
          onClick={testServerConnection}
          style={styles.button}
        >
          Test Server Connection
        </button>
      </div>

      {/* Quick Tests */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Quick API Tests</h3>
        <div style={styles.buttonGroup}>
          <button 
            onClick={runFullAPITest}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Testing...' : 'Run Full API Test'}
          </button>
          <button 
            onClick={testCustomerCreation}
            style={styles.button}
          >
            Test Customer Creation
          </button>
          <button 
            onClick={testCustomerInquiry}
            style={styles.button}
          >
            Test Customer Inquiry
          </button>
        </div>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Test Results</h3>
          {Object.entries(testResults).map(([key, result]) => (
            <div key={key} style={styles.resultRow}>
              <div style={styles.resultHeader}>
                <span style={{ fontSize: '1.2rem' }}>
                  {getStatusIcon(result.status)}
                </span>
                <span style={styles.resultTitle}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} API
                </span>
                <span style={{ 
                  color: getStatusColor(result.status),
                  fontWeight: 'bold' 
                }}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              <p style={styles.resultMessage}>{result.message}</p>
              {result.data && (
                <pre style={styles.resultData}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Debug Instructions</h3>
        <ol style={styles.instructions}>
          <li>First, ensure your Spring Boot backend is running on <code>http://localhost:8080</code></li>
          <li>Click "Test Server Connection" to verify basic connectivity</li>
          <li>Click "Run Full API Test" to test all endpoints</li>
          <li>Check the browser console (F12) for detailed API logs</li>
          <li>If tests fail, check the error messages and your backend logs</li>
        </ol>
        
        <h4>Common Issues:</h4>
        <ul style={styles.issues}>
          <li>Backend not running: Start with <code>mvn spring-boot:run</code></li>
          <li>CORS errors: Check backend CORS configuration</li>
          <li>404 errors: Verify API endpoint URLs match backend controllers</li>
          <li>Function not found: Check API service method names</li>
        </ul>
      </div>

      {/* Console Commands */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Console Debug Commands</h3>
        <p>Open browser console (F12) and run these:</p>
        <pre style={styles.codeBlock}>
{`// Check available API methods
debugAPI.logAvailableMethods();

// Quick connectivity test  
debugAPI.quickTest();

// Test specific endpoint
debugAPI.testEndpoint('/customers', 'GET');`}
        </pre>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  title: {
    color: '#2c3e50',
    fontSize: '2rem',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: '1rem'
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  },
  cardTitle: {
    color: '#2c3e50',
    fontSize: '1.3rem',
    marginBottom: '1rem',
    borderBottom: '2px solid #6db33f',
    paddingBottom: '0.5rem'
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    fontSize: '1rem'
  },
  button: {
    backgroundColor: '#6db33f',
    color: 'white',
    border: 'none',
    padding: '0.7rem 1.2rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    margin: '0.25rem',
    transition: 'background-color 0.3s'
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  resultRow: {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    border: '1px solid #dee2e6'
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  resultTitle: {
    fontWeight: '600',
    fontSize: '1rem',
    flex: 1,
    marginLeft: '0.5rem'
  },
  resultMessage: {
    color: '#495057',
    fontSize: '0.9rem',
    margin: '0.5rem 0'
  },
  resultData: {
    backgroundColor: '#e9ecef',
    padding: '0.5rem',
    borderRadius: '3px',
    fontSize: '0.8rem',
    overflow: 'auto',
    maxHeight: '200px'
  },
  instructions: {
    color: '#495057',
    lineHeight: '1.6'
  },
  issues: {
    color: '#495057',
    lineHeight: '1.6',
    marginTop: '1rem'
  },
  codeBlock: {
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    padding: '1rem',
    borderRadius: '5px',
    fontSize: '0.9rem',
    overflow: 'auto'
  }
};

export default APITestComponent;