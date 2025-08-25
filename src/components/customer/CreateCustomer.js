// src/components/customer/CreateCustomer.js
// Fixed to work with your existing API method names
import React, { useState } from 'react';
import { customerAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

/**
 * Enhanced Create Customer Component
 * Fixed to work with your existing API structure (customerAPI.createCustomer)
 * Assessment Requirement: "Create Customer: Accepts customer name and creates a customer with auto-generated ID"
 */
const CreateCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && formData.phone.length > 20) {
      errors.phone = 'Phone number must not exceed 20 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null
      };

      // Using YOUR existing API method name: createCustomer (not create)
      console.log('🚀 Calling customerAPI.createCustomer with:', customerData);
      const newCustomer = await customerAPI.createCustomer(customerData);
      console.log('✅ Customer created successfully:', newCustomer);
      
      setSuccess(newCustomer);
      setFormData({ name: '', email: '', phone: '' });
      setFormErrors({});
    } catch (err) {
      console.error('❌ Customer creation failed:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return <LoadingSpinner message="Creating customer account..." />;
  }

  return (
    <div className="springbank-container">
      {/* Header Section */}
      <div className="springbank-header">
        <h2 className="springbank-title">
          👤 Create New Customer
        </h2>
        <p className="springbank-subtitle">
          Add a new customer to the SpringBank system
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="springbank-success">
          <h3 className="springbank-success-title">✅ Customer Created Successfully!</h3>
          <div className="springbank-success-details">
            <div className="springbank-detail-row">
              <span className="springbank-detail-label">Customer ID:</span>
              <span className="springbank-highlight-value">{success.id}</span>
            </div>
            <div className="springbank-detail-row">
              <span className="springbank-detail-label">Name:</span>
              <span className="springbank-detail-value">{success.name}</span>
            </div>
            {success.email && (
              <div className="springbank-detail-row">
                <span className="springbank-detail-label">Email:</span>
                <span className="springbank-detail-value">{success.email}</span>
              </div>
            )}
            {success.phone && (
              <div className="springbank-detail-row">
                <span className="springbank-detail-label">Phone:</span>
                <span className="springbank-detail-value">{success.phone}</span>
              </div>
            )}
            <div className="springbank-detail-row">
              <span className="springbank-detail-label">Created Date:</span>
              <span className="springbank-detail-value">
                {success.createdDate ? new Date(success.createdDate).toLocaleString() : 'Just now'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <ErrorMessage error={error} onRetry={handleRetry} />}

      {/* Create Customer Form */}
      <div className="springbank-card">
        <form onSubmit={handleSubmit} className="springbank-form">
          {/* Full Name Field */}
          <div className="springbank-form-group">
            <label className="springbank-label">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter customer's full name"
              className={`springbank-input ${formErrors.name ? 'error' : ''}`}
              required
            />
            {formErrors.name && (
              <span className="springbank-error-text">{formErrors.name}</span>
            )}
          </div>

          {/* Email Field */}
          <div className="springbank-form-group">
            <label className="springbank-label">
              Email Address (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="customer@example.com"
              className={`springbank-input ${formErrors.email ? 'error' : ''}`}
            />
            {formErrors.email && (
              <span className="springbank-error-text">{formErrors.email}</span>
            )}
          </div>

          {/* Phone Field */}
          <div className="springbank-form-group">
            <label className="springbank-label">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1-234-567-8900"
              className={`springbank-input ${formErrors.phone ? 'error' : ''}`}
            />
            {formErrors.phone && (
              <span className="springbank-error-text">{formErrors.phone}</span>
            )}
          </div>

          {/* Submit Button */}
          <div className="springbank-text-center springbank-mt-2">
            <button
              type="submit"
              disabled={loading}
              className="springbank-button springbank-button-primary"
            >
              <span>👤</span>
              Create Customer
            </button>
          </div>
        </form>

        {/* Information Section */}
        <div className="springbank-info-section">
          <h4 className="springbank-info-title">Important Information:</h4>
          <ul className="springbank-info-list">
            <li>Customer ID will be automatically generated</li>
            <li>Full name is required for account creation</li>
            <li>Email and phone are optional but recommended</li>
            <li>Customer can have multiple accounts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomer;