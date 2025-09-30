import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ClientSidebar from "./ClientSidebar/ClientSidebar";
import ClientNavbar from "./ClientNavbar/ClientNavbar";
import "./clientLayout.css";

const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="client-layout">
      <ClientSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <ClientNavbar toggleSidebar={toggleSidebar} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ClientLayout;
