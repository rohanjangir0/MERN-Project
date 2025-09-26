import React from "react";
import { Search, Settings } from "lucide-react";
import "./AdminNavbar.css";

export default function AdminNavbar() {
  return (
    <header className="admin-navbar">
      {/* Left: Title */}
      <div className="navbar-left">
        <h2>Employee Management</h2>
        <p>Admin Management Portal</p>
      </div>

      {/* Right: Search + Settings */}
      <div className="navbar-right">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>
        <Settings className="settings-btn" size={20} />
      </div>
    </header>
  );
}
