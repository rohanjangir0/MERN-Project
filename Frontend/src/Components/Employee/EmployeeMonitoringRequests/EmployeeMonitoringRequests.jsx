import React, { useEffect, useState } from "react";
import { useSocket } from "../../../context/SocketContext";
import axios from "axios";
import "./EmployeeMonitoringRequests.css";

export default function EmployeeMonitoringRequests({ employeeId, employeeName }) {
  const socket = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employeeId) {
      setError("⚠️ Employee ID not provided");
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch pending requests from backend
    const fetchPendingRequests = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/monitoringRequests/employee/${employeeId}`
        );
        if (isMounted) setRequests(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching requests:", err);
        if (isMounted) setError("Failed to fetch monitoring requests");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPendingRequests();

    if (!socket) return;

    // Notify server that employee is online
    socket.emit("employeeOnline", { id: employeeId, name: employeeName || "Employee" });

    // Handle new monitoring request
    const handleNewRequest = (req) => {
      setRequests((prev) =>
        prev.some((r) => r._id === req._id) ? prev : [...prev, req]
      );
    };

    // Handle request updates (accepted/declined)
    const handleRequestResponse = (updatedReq) => {
      setRequests((prev) =>
        prev.map((r) => (r._id === updatedReq._id ? updatedReq : r))
      );
    };

    socket.on("receiveMonitoringRequest", handleNewRequest);
    socket.on("requestResponse", handleRequestResponse);

    return () => {
      isMounted = false;
      socket.off("receiveMonitoringRequest", handleNewRequest);
      socket.off("requestResponse", handleRequestResponse);
    };
  }, [socket, employeeId, employeeName]);

  // Employee responds to request
  const handleResponse = (req, status) => {
    if (!socket) return;

    socket.emit("respondMonitoringRequest", { ...req, status });

    // Optimistic UI update
    setRequests((prev) =>
      prev.map((r) => (r._id === req._id ? { ...r, status } : r))
    );
  };

  // ------------------ UI Rendering ------------------
  if (loading) return <p>⏳ Loading monitoring requests...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="employee-requests">
      <h2>Monitoring Requests</h2>

      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        requests.map((req) => (
          <div key={req._id} className={`request-card ${req.status}`}>
            <p>
              <strong>{req.type}</strong> - {req.message}
            </p>
            {req.status === "pending" ? (
              <div className="buttons">
                <button
                  className="allow-btn"
                  onClick={() => handleResponse(req, "accepted")}
                >
                  ✅ Allow
                </button>
                <button
                  className="deny-btn"
                  onClick={() => handleResponse(req, "declined")}
                >
                  ❌ Deny
                </button>
              </div>
            ) : (
              <p>Status: <strong>{req.status}</strong></p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
