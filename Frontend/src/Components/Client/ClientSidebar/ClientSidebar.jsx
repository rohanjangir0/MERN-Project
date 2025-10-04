import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./ClientSidebar.css";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaComments,
  FaPlus,
  FaLifeRing,
  FaSignOutAlt,
} from "react-icons/fa";

const ClientSidebar = ({ sidebarOpen }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === `/client/${path}`;

  return (
    <div className={`client-sidebar ${sidebarOpen ? "open" : "closed"}`}>
      {/* Header */}
      <div className="client-sidebar-header">
        <div className="logo-circle">👥</div>
        <div>
          <h2 className="client-sidebar-title">Client Portal</h2>
          <p className="client-sidebar-subtitle">Project Hub</p>
        </div>
      </div>

      {/* Menu */}
      <ul className="client-sidebar-menu">
        <li className={isActive("dashboard") ? "active" : ""}>
          <Link to="/client/dashboard">
            <FaTachometerAlt className="icon" /> <span>Dashboard</span>
          </Link>
        </li>
        <li className={isActive("project-request") ? "active" : ""}>
          <Link to="/client/project-request">
            <FaPlus className="icon" /> <span>Request Project</span>
          </Link>
        </li>
        <li className={isActive("proposals") ? "active" : ""}>
          <Link to="/client/proposals">
            <FaFileAlt className="icon" /> <span>Proposals</span>
          </Link>
        </li>
        <li className={isActive("support-tickets") ? "active" : ""}>
          <Link to="/client/support-tickets">
            <FaLifeRing className="icon" /> <span>Support & Tickets</span>
          </Link>
        </li>
        <li className={isActive("communication") ? "active" : ""}>
          <Link to="/client/communication">
            <FaComments className="icon" /> <span>Communication</span>
            <span className="badge">3</span>
          </Link>
        </li>
      </ul>

      {/* Footer */}
      <div className="client-sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">ER</div>
          <div>
            <p className="user-name">Emily Rodriguez</p>
            <p className="user-role">Project Manager</p>
          </div>
        </div>
        <button className="logout-btn">
          <FaSignOutAlt className="icon" /> Logout
        </button>
      </div>
    </div>
  );
};

export default ClientSidebar;
