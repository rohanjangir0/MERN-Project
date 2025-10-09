// context/MonitoringContext.jsx
import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { useSocket } from "./SocketContext";

const MonitoringContext = createContext();

export const MonitoringProvider = ({ children, employeeId, employeeName }) => {
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [latestRequest, setLatestRequest] = useState(null);
  const handledRequests = useRef(new Set()); // ✅ store handled request IDs

  // Fetch existing requests
  useEffect(() => {
    if (!employeeId) return;
    const fetchRequests = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/monitoringRequests/employee/${employeeId}`);
        const data = await res.json();
        setRequests(data || []);
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };
    fetchRequests();
  }, [employeeId]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !employeeId) return;

    socket.emit("employeeOnline", { id: employeeId, name: employeeName || "Employee" });

    const handleReceiveRequest = (req) => {
      if (req.employeeId === employeeId && !handledRequests.current.has(req._id)) {
        setRequests((prev) => (prev.some(r => r._id === req._id) ? prev : [...prev, req]));
        setLatestRequest(req); // show popup only if not handled
      }
    };

    const handleRequestResponse = (updatedReq) => {
      setRequests((prev) => prev.map(r => r._id === updatedReq._id ? updatedReq : r));
      // if latestRequest has been handled, remove popup
      if (latestRequest?._id === updatedReq._id) {
        setLatestRequest(null);
        handledRequests.current.add(updatedReq._id);
      }
    };

    socket.on("receiveMonitoringRequest", handleReceiveRequest);
    socket.on("requestResponse", handleRequestResponse);

    return () => {
      socket.off("receiveMonitoringRequest", handleReceiveRequest);
      socket.off("requestResponse", handleRequestResponse);
    };
  }, [socket, employeeId, employeeName, latestRequest]);

  const respondRequest = (req, status) => {
    if (!socket) return;

    socket.emit("respondMonitoringRequest", { ...req, status });

    // mark as handled
    handledRequests.current.add(req._id);

    // update request list
    setRequests((prev) => prev.map(r => r._id === req._id ? { ...r, status } : r));

    // remove popup if this is the latest request
    if (latestRequest?._id === req._id) {
      setLatestRequest(null);
    }
  };

  return (
    <MonitoringContext.Provider value={{ requests, latestRequest, respondRequest }}>
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => useContext(MonitoringContext);
