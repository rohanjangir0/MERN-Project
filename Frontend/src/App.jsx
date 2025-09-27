import React from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios"; // ✅ import axios here

import LoginPage from "./Components/Auth/LoginPage";
import EmployeeLayout from "./Components/Employee/EmployeeLayout";
import { employeeRoutes } from "./Components/Employee/employeeRoutes";
import AdminLayout from "./Components/Admin/AdminLayout";
import { adminRoutes } from "./Components/Admin/adminRoutes";
import ProtectedRoute from "./Components/common/ProtectedRoute";

// 🔹 Set the base URL for all axios requests
axios.defaults.baseURL = "https://mern-project-v3eg.onrender.com/api"; 
// Now all your axios calls automatically use this backend URL

function App() {
  return (
    <Routes>
      {/* Login Page */}
      <Route path="/" element={<LoginPage />} />

      {/* Reset Password Page */}
      <Route path="/reset-password/:token" element={<LoginPage />} />

      {/* Employee routes */}
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

      {/* Admin routes */}
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
    </Routes>
  );
}

export default App;
