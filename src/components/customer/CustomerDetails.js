import React from 'react';
import './CustomerDetails.css';

const CustomerDetails = ({ customer }) => {
  return (
    <div className="customer-details">
      <h3>Customer Information</h3>
      <div className="details-grid">
        <div className="detail-item">
          <label>Customer ID:</label>
          <span>{customer.id}</span>
        </div>
        <div className="detail-item">
          <label>Name:</label>
          <span>{customer.name}</span>
        </div>
        <div className="detail-item">
          <label>Email:</label>
          <span>{customer.email || 'Not provided'}</span>
        </div>
        <div className="detail-item">
          <label>Phone:</label>
          <span>{customer.phone || 'Not provided'}</span>
        </div>
        <div className="detail-item">
          <label>Created Date:</label>
          <span>{new Date(customer.createdDate).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;