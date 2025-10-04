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
  Briefcase,
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
      <aside className={`adm-sidebar ${sidebarOpen ? "adm-open" : ""}`}>
        {/* Logo */}
        <div className="adm-sidebar-logo">
          <div className="adm-logo-icon">🟢</div>
          <div>
            <h2>Admin Portal</h2>
            <p>Management Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="adm-sidebar-nav">
          {/* General Section */}
          <div className="adm-nav-section">
            <p className="adm-nav-section-title">General</p>
            <NavLink to="/admin/dashboard" className="adm-nav-link">
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/admin/analytics" className="adm-nav-link">
              <BarChart3 size={18} /> Analytics & Reports
            </NavLink>
            <NavLink to="/admin/chat" className="adm-nav-link">
              <MessageSquare size={18} /> Chat
            </NavLink>
            <NavLink to="/admin/documents" className="adm-nav-link">
              <FileText size={18} /> Documents
            </NavLink>
          </div>

          {/* Employee Section */}
          <div className="adm-nav-section">
            <p className="adm-nav-section-title">Employee</p>
            <NavLink to="/admin/employee-management" className="adm-nav-link">
              <Users size={18} /> Employee Management
            </NavLink>
            <NavLink to="/admin/task-management" className="adm-nav-link">
              <ClipboardList size={18} /> Task Management
            </NavLink>
            <NavLink to="/admin/leave-approvals" className="adm-nav-link">
              <CalendarCheck2 size={18} /> Leave Approvals
            </NavLink>
          </div>

          {/* Client Section */}
          <div className="adm-nav-section">
            <p className="adm-nav-section-title">Clients</p>
            <NavLink to="/admin/client-management" className="adm-nav-link">
              <Briefcase size={18} /> Client Management
            </NavLink>
            <NavLink to="/admin/client-proposals" className="adm-nav-link">
              <ClipboardList size={18} /> Client Proposals
            </NavLink>
            <NavLink to="/admin/tickets" className="adm-nav-link">
              <ClipboardList size={18} /> Support Tickets
            </NavLink>
          </div>

          {/* Settings Section */}
          <div className="adm-nav-section">
            <p className="adm-nav-section-title">Settings</p>
            <NavLink to="/admin/settings" className="adm-nav-link">
              <Settings size={18} /> Settings
            </NavLink>
          </div>
        </nav>

        {/* User Info */}
        <div className="adm-sidebar-user">
          <div className="adm-user-avatar">RJ</div>
          <div className="adm-user-info">
            <h4>Rohan Jangir</h4>
            <p>HR Manager • HR</p>
          </div>
        </div>

        {/* Logout */}
        <button className="adm-logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {sidebarOpen && (
        <div className="adm-sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </>
  );
}
