import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSocket } from "./SocketContext";

const MonitoringContext = createContext();

export const MonitoringProvider = ({ children, employeeId, employeeName }) => {
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [latestRequest, setLatestRequest] = useState(null);
  const handledRequests = useRef(new Set());

  // Fetch initial requests
  useEffect(() => {
    if (!employeeId) return;
    fetch(`http://localhost:5000/api/monitoringRequests/employee/${employeeId}`)
      .then(res => res.json())
      .then(data => setRequests(data || []))
      .catch(console.error);
  }, [employeeId]);

  // Setup socket listeners
  useEffect(() => {
    if (!socket || !employeeId) return;

    socket.emit("employeeOnline", { id: employeeId, name: employeeName || "Employee" });

    const receiveRequest = (req) => {
      if (req.employeeId !== employeeId) return;
      if (handledRequests.current.has(req._id)) return;

      setRequests(prev => [...prev, req]);
      setLatestRequest(req);
    };

    const requestResponse = (updatedReq) => {
      setRequests(prev => prev.map(r => r._id === updatedReq._id ? updatedReq : r));
      if (latestRequest?._id === updatedReq._id) {
        setLatestRequest(null);
        handledRequests.current.add(updatedReq._id);
      }
    };

    socket.on("receiveMonitoringRequest", receiveRequest);
    socket.on("requestResponse", requestResponse);

    return () => {
      socket.off("receiveMonitoringRequest", receiveRequest);
      socket.off("requestResponse", requestResponse);
    };
  }, [socket, employeeId, employeeName, latestRequest]);

  // Send response
  const respondRequest = (req, status, allowScreen = true, allowAudio = true, allowWebcam = true) => {
    if (!socket) return;

    socket.emit("respondMonitoringRequest", {
      ...req,
      status,
      allowScreen,
      allowAudio,
      allowWebcam
    });

    handledRequests.current.add(req._id);
    setRequests(prev => prev.map(r => r._id === req._id ? { ...r, status, allowScreen, allowAudio, allowWebcam } : r));
    if (latestRequest?._id === req._id) setLatestRequest(null);
  };

  return (
    <MonitoringContext.Provider value={{ requests, latestRequest, respondRequest }}>
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => useContext(MonitoringContext);
