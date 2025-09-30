import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ClientSidebar from "./ClientSidebar/ClientSidebar";
import ClientNavbar from "./ClientNavbar/ClientNavbar";
import "./clientLayout.css";

const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="client-layout">
      <ClientSidebar sidebarOpen={sidebarOpen} />
      <div className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}>
        <ClientNavbar toggleSidebar={toggleSidebar} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ClientLayout;
