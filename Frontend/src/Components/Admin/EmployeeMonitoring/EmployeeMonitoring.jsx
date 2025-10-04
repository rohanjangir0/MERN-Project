import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../../../context/SocketContext";
import "./EmployeeMonitoring.css";

export default function EmployeeMonitoring() {
  const socket = useSocket();
  const [employees, setEmployees] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const adminId = "admin-1";

  // Fetch initial employees and requests
  const fetchData = async () => {
    try {
      const empRes = await axios.get("http://localhost:5000/api/employees");
      setEmployees(empRes.data.map(emp => ({ ...emp, status: "Offline" })));

      const reqRes = await axios.get(
        `http://localhost:5000/api/monitoringRequests/admin/${adminId}`
      );
      setPendingRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;
    fetchData();

    // Admin online
    socket.emit("employeeOnline", { id: adminId, name: "Admin" });

    // Socket listeners
    const handleOnline = (list) => {
      setEmployees(prev => {
        const map = new Map(prev.map(e => [e.employeeId, e]));
        list.forEach(e => map.set(e.userId, { ...map.get(e.userId), ...e }));
        return Array.from(map.values());
      });
    };

    const handlePending = (list) => setPendingRequests(list);
    const handleSessions = (list) => setActiveSessions(list);

    socket.on("onlineEmployees", handleOnline);
    socket.on("pendingRequests", handlePending);
    socket.on("activeSessions", handleSessions);

    return () => {
      socket.off("onlineEmployees", handleOnline);
      socket.off("pendingRequests", handlePending);
      socket.off("activeSessions", handleSessions);
    };
  }, [socket]);

  // Request employee for monitoring
  const requestEmployee = (emp, type) => {
    if (!socket) return;

    // Prevent duplicate pending requests
    const existing = pendingRequests.find(
      r => r.employeeId === emp.employeeId && r.type === type && r.status === "pending"
    );
    if (existing) return;

    const req = {
      adminId,
      employeeId: emp.employeeId, // ✅ use employeeId
      type,
      message: `Admin requests ${type} access`,
    };

    // Optimistic UI
    setPendingRequests(prev => [
      ...prev,
      { ...req, _id: Date.now().toString(), status: "pending" }
    ]);

    socket.emit("sendMonitoringRequest", req);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="monitoring-container">
      <h2>Admin Dashboard</h2>

      <h3>Employees</h3>
      {employees.map(emp => (
        <div key={emp.employeeId} className="employee-card">
          <h4>{emp.name}</h4>
          <p>Status: {emp.status}</p>
          {["Screen", "Voice", "Webcam"].map(type => (
            <button
              key={type}
              onClick={() => requestEmployee(emp, type)}
              disabled={pendingRequests.some(
                r => r.employeeId === emp.employeeId && r.type === type && r.status === "pending"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      ))}

      <h3>Pending Requests</h3>
      {pendingRequests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        pendingRequests.map(r => (
          <div key={r._id} className={`request-card ${r.status}`}>
            <p>
              <strong>{r.employeeId}</strong> - {r.type}
            </p>
            <p>Status: {r.status}</p>
          </div>
        ))
      )}

      <h3>Active Sessions</h3>
      {activeSessions.length === 0 ? (
        <p>No active sessions</p>
      ) : (
        activeSessions.map(s => (
          <div key={s.id} className="session-card">
            <p>
              <strong>{s.employeeId}</strong> - {s.type}
            </p>
            <p>Started: {s.startedAt}</p>
            <button onClick={() => socket.emit("stopSession", s.id)}>Stop</button>
          </div>
        ))
      )}
    </div>
  );
}
