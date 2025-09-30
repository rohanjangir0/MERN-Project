import React from "react";
import "./ClientNavbar.css";
import { FaBars, FaBell, FaUserCircle } from "react-icons/fa";

const ClientNavbar = ({ toggleSidebar }) => {
  return (
    <nav className="client-navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h2 className="navbar-title">Client Portal</h2>
      </div>
      <div className="navbar-right">
        <button className="icon-btn">
          <FaBell />
        </button>
        <button className="icon-btn">
          <FaUserCircle />
        </button>
      </div>
    </nav>
  );
};

export default ClientNavbar;
