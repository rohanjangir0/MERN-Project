import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";
import { getSocket } from "../../../socket";

import "./EmployeeMonitoring.css";


export default function EmployeeMonitoring() {
  const [employees, setEmployees] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const adminId = "admin-1";

  useEffect(() => {
    const socket = getSocket();

    const fetchData = async () => {
      try {
        const empRes = await axios.get("http://localhost:5000/api/employees");
        setEmployees(empRes.data.map((emp) => ({ ...emp, status: "Offline" })));

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

    fetchData();

    socket.emit("employeeOnline", { id: adminId, name: "Admin" });

    socket.on("onlineEmployees", (onlineList) => {
      setEmployees((prev) =>
        prev.map((emp) => {
          const onlineInfo =
            onlineList.find((o) => o.userId === emp._id || o.name === emp.name) || {};
          return {
            ...emp,
            status: onlineInfo.status || "Offline",
            screen: onlineInfo.screen || false,
            voice: onlineInfo.voice || false,
            webcam: onlineInfo.webcam || false,
          };
        })
      );
    });

    socket.on("pendingRequests", (requests) => setPendingRequests(requests));
    socket.on("activeSessions", (sessions) => setActiveSessions(sessions));

    return () => {
      socket.off("onlineEmployees");
      socket.off("pendingRequests");
      socket.off("activeSessions");
    };
  }, []);

  const requestEmployee = (emp, type) => {
    const socket = getSocket();
    const req = {
      adminId,
      employeeId: emp._id,
      type,
      message: `Admin requests ${type} access`,
    };
    socket.emit("sendMonitoringRequest", req);
    setPendingRequests((prev) => [
      ...prev,
      { ...req, _id: Date.now().toString(), employeeName: emp.name, status: "pending" },
    ]);
  };

  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterStatus === "All" || emp.status === filterStatus)
    );
  });

  if (loading) return <p>Loading employees...</p>;

  return (
    <div className="monitoring-container">
      <header className="monitoring-header">
        <h2>Employee Monitoring Dashboard</h2>
        <p>Track employees, requests, and active sessions in real-time</p>
      </header>

      {/* Filters */}
      <div className="filters-container">
        <input
          type="text"
          placeholder="Search Employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      {/* Employee Cards */}
      <div className="employee-cards">
        {filteredEmployees.map((emp) => (
          <div key={emp._id} className="employee-card">
            <div className="avatar">{emp.name[0]}</div>
            <h4>{emp.name}</h4>
            <p className="role">{emp.department || "Department"}</p>
            <div className={`status ${emp.status === "Active" ? "on" : "off"}`}>
              {emp.status === "Active" ? "🟢 Active" : "🔴 Offline"}
            </div>
            <div className="actions">
              <button className="btn-screen" onClick={() => requestEmployee(emp, "Screen")}>Screen</button>
              <button className="btn-voice" onClick={() => requestEmployee(emp, "Voice")}>Voice</button>
              <button className="btn-screen" onClick={() => requestEmployee(emp, "Webcam")}>Webcam</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      <div className="requests-section">
        <h3>Pending Requests</h3>
        <div className="requests-grid">
          {pendingRequests.map((r) => (
            <div key={r._id} className={`request-card ${r.status}`}>
              <h4>{r.type} Request</h4>
              <p>{r.employeeName || r.employeeId}</p>
              <span className={`tag ${r.status === "accepted" ? "green" : ""}`}>
                {r.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="requests-section">
        <h3>Active Sessions</h3>
        <div className="requests-grid">
          {activeSessions.map((s) => (
            <div key={s.id} className="request-card active">
              <h4>{s.type} Session</h4>
              <p>{employees.find((e) => e._id === s.employeeId)?.name || s.employeeId}</p>
              <p>Started at {s.startedAt}</p>
              <button className="stop-btn" onClick={() => getSocket().emit("stopSession", s.id)}>Stop</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
