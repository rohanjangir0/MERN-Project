import React from "react";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./Components/Auth/LoginPage";
import EmployeeLayout from "./Components/Employee/EmployeeLayout";
import { employeeRoutes } from "./Components/Employee/employeeRoutes";
import AdminLayout from "./Components/Admin/AdminLayout";
import { adminRoutes } from "./Components/Admin/adminRoutes";
import ProtectedRoute from "./Components/common/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

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
