import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar/AdminSidebar";
import AdminNavbar from "./AdminNavbar/AdminNavbar";
import "./adminLayout.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="adm-layout">
      <AdminSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`adm-main-content ${sidebarOpen ? "adm-sidebar-open" : ""}`}>
        <AdminNavbar toggleSidebar={toggleSidebar} />
        <div className="adm-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
