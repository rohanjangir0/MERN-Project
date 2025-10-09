// EmployeeLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Navbar from "./Navbar/Navbar";
import MonitoringPopup from "./EmployeeMonitoringRequests/MonitoringPopup";
import { MonitoringProvider } from "../../context/MonitoringContext";
import "./EmployeeLayout.css";

const EmployeeLayout = () => {
  const employeeId = localStorage.getItem("employeeId");
  const employeeName = localStorage.getItem("name") || "Employee";

  return (
    <MonitoringProvider employeeId={employeeId} employeeName={employeeName}>
      <div className="employee-layout">
        <Sidebar />
        <div className="main-area">
          <Navbar />
          <div className="content">
            <Outlet />
            <MonitoringPopup /> {/* global popup */}
          </div>
        </div>
      </div>
    </MonitoringProvider>
  );
};

export default EmployeeLayout;
