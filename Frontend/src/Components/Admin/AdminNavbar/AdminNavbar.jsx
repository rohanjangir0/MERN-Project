import React from "react";
import { Settings, LogOut } from "lucide-react";
import "./AdminNavbar.css";

export default function AdminNavbar({ toggleSidebar, handleLogout }) {
  return (
    <div className="admin-navbar">
      {/* Hamburger for mobile */}
      <button className="mobile-hamburger" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Minimal user actions on the right */}
      <div className="user-actions">
        <Settings size={20} />
        <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
