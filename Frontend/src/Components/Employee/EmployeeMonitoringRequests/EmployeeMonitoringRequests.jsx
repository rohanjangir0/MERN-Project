import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Check, X } from "lucide-react";
import axios from "axios";

let socket;

export default function EmployeeMonitoringRequests({ employeeId, employeeName }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!employeeId) return;

    if (!socket) {
      socket = io("http://localhost:5000");
    }

    socket.on("connect", () => {
      socket.emit("employeeOnline", { id: employeeId, name: employeeName });

      axios
        .get(`http://localhost:5000/api/monitoringRequests/employee/${employeeId}`)
        .then((res) => setRequests(res.data))
        .catch(console.error);
    });

    socket.on("receiveMonitoringRequest", (req) => {
      setRequests((prev) => {
        if (!prev.find((r) => r._id === req._id)) return [...prev, req];
        return prev;
      });
    });

    socket.on("requestResponse", (res) => {
      setRequests((prev) =>
        prev.map((r) => (r._id === res._id ? { ...r, status: res.status } : r))
      );
    });

    return () => {
      // Do NOT disconnect socket here, keep singleton alive
      socket.off("receiveMonitoringRequest");
      socket.off("requestResponse");
    };
  }, [employeeId, employeeName]);

  const handleResponse = (req, status) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === req._id ? { ...r, status } : r))
    );

    socket.emit("respondMonitoringRequest", {
      id: req._id,
      adminId: req.adminId,
      employeeId,
      type: req.type,
      status,
    });
  };

  return (
    <div>
      <h2>Monitoring Requests</h2>
      {requests.map((req) => (
        <div key={req._id}>
          <h4>{req.type}</h4>
          <p>{req.message}</p>
          {req.status === "pending" ? (
            <>
              <button onClick={() => handleResponse(req, "accepted")}>Allow</button>
              <button onClick={() => handleResponse(req, "declined")}>Deny</button>
            </>
          ) : (
            <p>{req.status}</p>
          )}
        </div>
      ))}
    </div>
  );
}
