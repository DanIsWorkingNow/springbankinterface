import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ error, onRetry }) => {
  const getErrorMessage = (error) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.response?.data?.validationErrors) {
      return Object.values(error.response.data.validationErrors).join(', ');
    }
    return error?.message || 'An unexpected error occurred';
  };

  return (
    <div className="error-message">
      <div className="error-content">
        <h3>Error</h3>
        <p>{getErrorMessage(error)}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;