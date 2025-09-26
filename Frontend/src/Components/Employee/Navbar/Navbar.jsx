import React from "react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2>Dashboard</h2>
        <p>Welcome back</p>
      </div>

      <div className="navbar-center">
        <input type="text" placeholder="Search..." className="search-bar" />
      </div>

      <div className="navbar-right">
        <button className="icon-btn material-symbols-outlined">settings</button>
      </div>
    </div>
  );
}
