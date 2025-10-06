import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Room, RoomEvent } from "livekit-client";
import { useSocket } from "../../../context/SocketContext";
import "./EmployeeMonitoring.css";

export default function EmployeeMonitoring() {
  const { socket } = useSocket();
  const [employees, setEmployees] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoContainerRef = useRef(null);

  const adminId = "admin-1";

  useEffect(() => {
    if (!socket) return;

    fetchData();

    socket.emit("employeeOnline", { id: adminId, name: "Admin" });

    socket.on("onlineEmployees", handleOnline);
    socket.on("pendingRequests", setPendingRequests);
    socket.on("activeSessions", setActiveSessions);
    socket.on("requestResponse", handleRequestResponse);

    return () => {
      socket.off("onlineEmployees");
      socket.off("pendingRequests");
      socket.off("activeSessions");
      socket.off("requestResponse");
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      const empRes = await axios.get("http://localhost:5000/api/employees");
      setEmployees(empRes.data);

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

  const handleOnline = (list) => {
    setEmployees((prev) =>
      prev.map((emp) => ({
        ...emp,
        status: list.some((e) => e.userId === emp.employeeId) ? "Online" : "Offline",
      }))
    );
  };

  const handleRequestResponse = (req) => {
    if (req.status === "accepted") startViewing(req);
  };

  const requestEmployee = (emp, type) => {
    if (!socket) return;

    const req = {
      adminId,
      employeeId: emp.employeeId,
      type,
      message: `Admin requests ${type} access`,
    };

    socket.emit("sendMonitoringRequest", req);

    setPendingRequests((prev) => [
      ...prev,
      { ...req, _id: Date.now().toString(), status: "pending" },
    ]);
  };

  const startViewing = async (req) => {
    try {
      const roomName = `monitoring-${req.employeeId}-${req._id}`;

      const res = await fetch(
        `http://localhost:5000/api/livekit/token?room=${roomName}&identity=${adminId}&name=Admin`
      );
      const { token, url } = await res.json(); // ✅ token is string

      const room = new Room();
      await room.connect(url, token);

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === "video" || track.kind === "audio") {
          const el = track.attach();
          el.style.width = track.kind === "video" ? "100%" : "0";
          el.style.maxHeight = "500px";
          videoContainerRef.current.innerHTML = "";
          videoContainerRef.current.appendChild(el);
        }
      });
    } catch (err) {
      console.error("Admin view failed:", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="monitoring">
      <h2>Employee Monitoring Dashboard</h2>

      <section className="employee-list">
        {employees.map((emp) => (
          <div key={emp.employeeId} className="employee-card">
            <h4>{emp.name}</h4>
            <p>Status: {emp.status}</p>
            <div className="btn-group">
              {["Screen", "Voice", "Webcam"].map((type) => (
                <button key={type} onClick={() => requestEmployee(emp, type)}>
                  Request {type}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="viewer">
        <h3>Live View</h3>
        <div ref={videoContainerRef} className="livekit-view"></div>
      </section>
    </div>
  );
}
