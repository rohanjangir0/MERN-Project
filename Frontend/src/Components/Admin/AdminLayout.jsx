import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar/AdminSidebar";
import AdminNavbar from "./AdminNavbar/AdminNavbar";
import "./AdminLayout.css"; // new file for layout styling

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <div className="main-content">
        <AdminNavbar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
