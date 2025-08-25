import React, { useState } from 'react';
import CreateCustomer from './components/customer/CreateCustomer';
import InquireCustomer from './components/customer/InquireCustomer';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="app">
      <header className="app-header">
        <h1>SpringBank - Customer Management</h1>
        <nav className="nav-tabs">
          <button 
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
          >
            Create Customer
          </button>
          <button 
            className={activeTab === 'inquire' ? 'active' : ''}
            onClick={() => setActiveTab('inquire')}
          >
            Inquire Customer
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'create' && <CreateCustomer />}
        {activeTab === 'inquire' && <InquireCustomer />}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 SpringBank Application - Assessment Phase 2</p>
      </footer>
    </div>
  );
}

export default App;