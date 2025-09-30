import React from "react";
import "./ClientSidebar.css";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaComments,
  FaCalendarAlt,
  FaDownload,
  FaCog,
  FaSignOutAlt,
  FaPlus,
} from "react-icons/fa";

const ClientSidebar = () => {
  return (
    <div className="client-sidebar">
      {/* Header */}
      <div className="client-sidebar-header">
        <div className="client-sidebar-logo">👥</div>
        <div>
          <h2 className="client-sidebar-title">Client Portal</h2>
          <p className="client-sidebar-subtitle">Project Hub</p>
        </div>
      </div>

      {/* Menu */}
      <ul className="client-sidebar-menu">
        <li className="active">
          <FaTachometerAlt className="icon" /> Dashboard
        </li>
        <li>
          <FaPlus className="icon" /> Request Project
        </li>
        <li>
          <FaFileAlt className="icon" /> Proposals
        </li>
        <li className="with-badge">
          <FaComments className="icon" /> Communication
          <span className="badge">3</span>
        </li>
        <li>
          <FaCalendarAlt className="icon" /> Schedule
        </li>
        <li>
          <FaDownload className="icon" /> Documents
        </li>
        <li>
          <FaCog className="icon" /> Settings
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
