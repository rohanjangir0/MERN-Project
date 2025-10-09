// src/context/MonitoringContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { useSocket } from "./SocketContext";

const MonitoringContext = createContext();

export const MonitoringProvider = ({ children, employeeId, employeeName }) => {
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [activePopupRequest, setActivePopupRequest] = useState(null);

  // Fetch existing requests from backend
  useEffect(() => {
    if (!employeeId) return;

    const fetchRequests = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/monitoringRequests/employee/${employeeId}`
        );
        const data = await res.json();
        setRequests(data || []);
      } catch (err) {
        console.error("Error fetching monitoring requests:", err);
      }
    };

    fetchRequests();
  }, [employeeId]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !employeeId) return;

    socket.emit("employeeOnline", { id: employeeId, name: employeeName || "Employee" });

    const handleReceiveRequest = (req) => {
      if (req.employeeId === employeeId) {
        setRequests((prev) => (prev.some(r => r._id === req._id) ? prev : [...prev, req]));
        setActivePopupRequest(req); // trigger popup
      }
    };

    const handleRequestResponse = (updatedReq) => {
      setRequests((prev) =>
        prev.map((r) => (r._id === updatedReq._id ? updatedReq : r))
      );
      if (activePopupRequest?._id === updatedReq._id) {
        setActivePopupRequest(updatedReq); // update popup if open
      }
    };

    socket.on("receiveMonitoringRequest", handleReceiveRequest);
    socket.on("requestResponse", handleRequestResponse);

    return () => {
      socket.off("receiveMonitoringRequest", handleReceiveRequest);
      socket.off("requestResponse", handleRequestResponse);
    };
  }, [socket, employeeId, employeeName, activePopupRequest]);

  const respondRequest = (req, status) => {
    if (!socket) return;
    socket.emit("respondMonitoringRequest", { ...req, status });

    setRequests((prev) =>
      prev.map((r) => (r._id === req._id ? { ...r, status } : r))
    );

    if (activePopupRequest?._id === req._id) {
      setActivePopupRequest(null); // close popup
    }
  };

  return (
    <MonitoringContext.Provider value={{ requests, activePopupRequest, setActivePopupRequest, respondRequest }}>
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => useContext(MonitoringContext);
