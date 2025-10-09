import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Navbar from "./Navbar/Navbar";
import "./EmployeeLayout.css";
import MonitoringPopup from "./EmployeeMonitoringRequests/MonitoringPopup";

const EmployeeLayout = () => {
  // ✅ Define id and name from localStorage
  const id = localStorage.getItem("employeeId");
  const name = localStorage.getItem("name") || "Employee";

  return (
    <div className="employee-layout">
      <Sidebar />
      <div className="main-area">
        <Navbar />
        <div className="content">
          <Outlet /> {/* employee pages will render here */}
          <MonitoringPopup /> {/* global popup */}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
