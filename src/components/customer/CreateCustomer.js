import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { customerAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './CreateCustomer.css';

const CreateCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset 
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await customerAPI.create(data);
      setSuccess({
        message: `Customer created successfully!`,
        data: result
      });
      reset(); // Clear form
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Creating customer..." />;
  }

  return (
    <div className="create-customer">
      <h2>Create New Customer</h2>
      
      {error && <ErrorMessage error={error} />}
      
      {success && (
        <div className="success-message">
          <h3>Success!</h3>
          <p>{success.message}</p>
          <div className="customer-details">
            <p><strong>ID:</strong> {success.data.id}</p>
            <p><strong>Name:</strong> {success.data.name}</p>
            <p><strong>Email:</strong> {success.data.email}</p>
            <p><strong>Created:</strong> {new Date(success.data.createdDate).toLocaleString()}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="customer-form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            type="text"
            {...register('name', { 
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
              maxLength: { value: 100, message: 'Name must not exceed 100 characters' }
            })}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
              },
              maxLength: { value: 100, message: 'Email must not exceed 100 characters' }
            })}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            {...register('phone', {
              maxLength: { value: 20, message: 'Phone must not exceed 20 characters' }
            })}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-text">{errors.phone.message}</span>}
        </div>

        <button type="submit" className="submit-button">
          Create Customer
        </button>
      </form>
    </div>
  );
};

export default CreateCustomer;