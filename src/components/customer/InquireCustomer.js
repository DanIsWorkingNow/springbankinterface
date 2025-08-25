import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { customerAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import CustomerDetails from './CustomerDetails';
import './InquireCustomer.css';

const InquireCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setCustomer(null);

    try {
      const result = await customerAPI.getById(data.customerId);
      setCustomer(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setCustomer(null);
  };

  if (loading) {
    return <LoadingSpinner message="Searching for customer..." />;
  }

  return (
    <div className="inquire-customer">
      <h2>Customer Inquiry</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="search-form">
        <div className="form-group">
          <label htmlFor="customerId">Customer ID *</label>
          <input
            id="customerId"
            type="number"
            min="1"
            {...register('customerId', { 
              required: 'Customer ID is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Customer ID must be a positive number' }
            })}
            className={errors.customerId ? 'error' : ''}
            placeholder="Enter customer ID"
          />
          {errors.customerId && <span className="error-text">{errors.customerId.message}</span>}
        </div>

        <button type="submit" className="search-button">
          Search Customer
        </button>
      </form>

      {error && <ErrorMessage error={error} onRetry={handleRetry} />}
      
      {customer && <CustomerDetails customer={customer} />}
    </div>
  );
};

export default InquireCustomer;