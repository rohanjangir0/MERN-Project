import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar/AdminSidebar";
import AdminNavbar from "./AdminNavbar/AdminNavbar";
import "./adminLayout.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // default open
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="admin-layout">
      <AdminSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}>
        <AdminNavbar toggleSidebar={toggleSidebar} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
