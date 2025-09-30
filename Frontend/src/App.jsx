import React from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";

import LoginPage from "./Components/Auth/LoginPage";

// Employee
import EmployeeLayout from "./Components/Employee/EmployeeLayout";
import { employeeRoutes } from "./Components/Employee/employeeRoutes";

// Admin
import AdminLayout from "./Components/Admin/AdminLayout";
import { adminRoutes } from "./Components/Admin/adminRoutes";

// Client
import ClientLayout from "./Components/Client/clientLayout";
import { clientRoutes } from "./Components/Client/clientRoutes";

import ProtectedRoute from "./Components/common/ProtectedRoute";

// 🔹 Set the base URL for all axios requests
axios.defaults.baseURL = "https://mern-project-v3eg.onrender.com/api";

function App() {
  return (
    <Routes>
      {/* Login Page */}
      <Route path="/" element={<LoginPage />} />

      {/* Reset Password Page */}
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
    </Routes>
  );
}

export default App;
