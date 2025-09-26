import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Navbar from "./Navbar/Navbar";
import "./EmployeeLayout.css";

const EmployeeLayout = () => {
  return (
    <div className="employee-layout">
      <Sidebar />
      <div className="main-area">
        <Navbar />
        <div className="content">
          <Outlet /> {/* employee pages will render here */}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
