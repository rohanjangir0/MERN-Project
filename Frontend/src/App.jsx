import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import LoginPage from "./Components/Auth/LoginPage";

import EmployeeLayout from "./Components/Employee/EmployeeLayout";
import { employeeRoutes } from "./Components/Employee/employeeRoutes";

import AdminLayout from "./Components/Admin/AdminLayout";
import { adminRoutes } from "./Components/Admin/adminRoutes";

import ClientLayout from "./Components/Client/clientLayout";
import { clientRoutes } from "./Components/Client/clientRoutes";

import ProtectedRoute from "./Components/common/ProtectedRoute";

// Set base URL for Axios
axios.defaults.baseURL = "https://mern-project-v3eg.onrender.com/api";

// Helper: check if user is logged in
const isLoggedIn = () => !!localStorage.getItem("authToken");

function App() {
  return (
    <Routes>
      {/* Login */}
      <Route
        path="/"
        element={
          isLoggedIn() ? (
            // Redirect to the right dashboard based on role
            (() => {
              const role = localStorage.getItem("role"); // 'Admin', 'Employee', 'Client'
              if (role === "Admin") return <Navigate to="/admin/dashboard" />;
              if (role === "Employee") return <Navigate to="/employee/dashboard" />;
              if (role === "Client") return <Navigate to="/client/dashboard" />;
              return <LoginPage />;
            })()
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Reset Password */}
      <Route path="/reset-password/:token" element={<LoginPage />} />

      {/* Employee Routes */}
      <Route
        path="/employee/*"
        element={
          <ProtectedRoute role="Employee">
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        {employeeRoutes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="Admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {adminRoutes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}
      </Route>

      {/* Client Routes */}
      <Route
        path="/client/*"
        element={
          <ProtectedRoute role="Client">
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        {clientRoutes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}
      </Route>

      {/* Fallback for unknown routes */}
      <Route
        path="*"
        element={
          isLoggedIn() ? (
            (() => {
              const role = localStorage.getItem("role");
              if (role === "Admin") return <Navigate to="/admin/dashboard" />;
              if (role === "Employee") return <Navigate to="/employee/dashboard" />;
              if (role === "Client") return <Navigate to="/client/dashboard" />;
              return <Navigate to="/" />;
            })()
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
}

export default App;
