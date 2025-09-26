// src/Components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ role, children }) => {
  const userRole = localStorage.getItem("role");

  if (!userRole) return <Navigate to="/" />;

  // Case-insensitive check
  if (userRole.toLowerCase() !== role.toLowerCase()) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
