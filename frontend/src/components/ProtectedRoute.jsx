import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requirePremium = false }) {
  const token = localStorage.getItem('token');
  const isPremium = localStorage.getItem('isPremium') === 'true';

  // Check if user is logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if premium is required
  if (requirePremium && !isPremium) {
    return <Navigate to="/premium" replace />;
  }

  return children;
}

export default ProtectedRoute;
