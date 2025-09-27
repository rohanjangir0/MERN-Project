import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarCheck2,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import "./AdminSidebar.css";

export default function AdminSidebar({ sidebarOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🟢</div>
          <div>
            <h2>Admin Portal</h2>
            <p>Management Dashboard</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className="nav-link">
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/employee-management" className="nav-link">
            <Users size={18} /> Employee Management
          </NavLink>
          <NavLink to="/admin/task-management" className="nav-link">
            <ClipboardList size={18} /> Task Management
          </NavLink>
          <NavLink to="/admin/leave-approvals" className="nav-link">
            <CalendarCheck2 size={18} /> Leave Approvals
          </NavLink>
          <NavLink to="/admin/documents" className="nav-link">
            <FileText size={18} /> Documents
          </NavLink>
          <NavLink to="/admin/chat" className="nav-link">
            <MessageSquare size={18} /> Chat
          </NavLink>
          <NavLink to="/admin/analytics" className="nav-link">
            <BarChart3 size={18} /> Analytics & Reports
          </NavLink>
          <NavLink to="/admin/settings" className="nav-link">
            <Settings size={18} /> Settings
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">SJ</div>
          <div className="user-info">
            <h4>Sarah Johnson</h4>
            <p>HR Manager • HR</p>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
}
