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
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);

  const videoContainerRef = useRef(null);
  const roomRef = useRef(null);
  const currentTrackRef = useRef(null);
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
      disconnectRoom();
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
        status: list.some((e) => e.userId === emp.employeeId)
          ? "Online"
          : "Offline",
      }))
    );
  };

  const handleRequestResponse = (req) => {
    if (req.status === "accepted") startViewing(req);
  };

  const requestEmployee = (emp) => {
    setSelectedEmployee(emp);
    setShowModal(true);
  };

  const sendRequest = (type, reason, duration) => {
    if (!socket || !selectedEmployee) return;

    const req = {
      adminId,
      employeeId: selectedEmployee.employeeId,
      type,
      message: reason || `Admin requests ${type} access`,
      duration,
    };

    socket.emit("sendMonitoringRequest", req);

    setPendingRequests((prev) => [
      ...prev,
      { ...req, _id: Date.now().toString(), status: "pending" },
    ]);

    setShowModal(false);
  };

  const disconnectRoom = () => {
    detachTrack();
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (videoContainerRef.current) videoContainerRef.current.innerHTML = "";
  };

  // ---------------- Updated startViewing ----------------
  const startViewing = async (req) => {
    try {
      if (!selectedEmployee) return;

      const roomName = `monitoring-${selectedEmployee.employeeId}-${req._id}`;
      const res = await fetch(
        `http://localhost:5000/api/livekit/token?room=${roomName}&identity=${adminId}&name=Admin`
      );
      const { token, url } = await res.json();

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      // Room event listeners
      room.on(RoomEvent.Disconnected, () => {
        if (videoContainerRef.current)
          videoContainerRef.current.innerHTML =
            "<p class='disconnected'>🔴 Stream ended or disconnected</p>";
      });
      room.on(RoomEvent.Reconnecting, () => setReconnecting(true));
      room.on(RoomEvent.Reconnected, () => setReconnecting(false));

      // Subscribe to new tracks
      room.on(RoomEvent.TrackSubscribed, attachTrack);
      room.on(RoomEvent.TrackUnsubscribed, detachTrack);

      // Connect to LiveKit room
      await room.connect(url, token);

      // Subscribe to existing tracks safely
      for (const participant of room.participants.values()) {
        for (const publication of participant.tracks.values()) {
          if (publication.isSubscribed && publication.track) {
            attachTrack(publication.track);
          } else {
            publication.on("subscribed", attachTrack);
          }
        }
      }

      console.log("✅ Admin connected and ready to view employee screen");
    } catch (err) {
      console.error("❌ Viewing failed:", err);
      alert("Failed to view employee screen. Check network or LiveKit server.");
    }
  };

  // ---------------- Helper functions ----------------
  const attachTrack = (track) => {
    if (!track || !videoContainerRef.current) return;

    if (currentTrackRef.current) detachTrack();

    const el = track.attach();
    el.style.width = "100%";
    el.style.borderRadius = "16px";
    el.style.maxHeight = "480px";

    videoContainerRef.current.innerHTML = "";
    videoContainerRef.current.appendChild(el);

    currentTrackRef.current = track;
  };

  const detachTrack = () => {
    if (currentTrackRef.current) {
      currentTrackRef.current.detach();
      currentTrackRef.current = null;
    }
    if (videoContainerRef.current)
      videoContainerRef.current.innerHTML =
        "<p class='disconnected'>🔴 Stream ended</p>";
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="monitoring-dashboard">
      <header className="header">
        <h1>Employee Monitoring Center</h1>
        <p>Real-time insights with Apple-like premium design ✨</p>
      </header>

      {reconnecting && (
        <div className="reconnecting-banner">
          🔄 Reconnecting to live stream...
        </div>
      )}

      <div className="status-bar">
        <span className="online">
          🟢 {employees.filter((e) => e.status === "Online").length} Online
        </span>
        <span className="active">📺 {activeSessions.length} Active</span>
      </div>

      <h2 className="section-title">Employees Overview</h2>
      <div className="bento-grid">
        {employees.map((emp, idx) => (
          <div
            key={emp.employeeId || emp._id || `emp-${idx}`}
            className={`bento-card ${emp.status?.toLowerCase() || "offline"}`}
          >
            <div className="bento-header">
              <div>
                <h3>{emp.name || emp.employeeName || "Unnamed Employee"}</h3>
                <p>{emp.role || "Role not specified"}</p>
              </div>
              <span
                className={`status-dot ${
                  emp.status === "Online"
                    ? "green"
                    : emp.status === "Offline"
                    ? "gray"
                    : "orange"
                }`}
              ></span>
            </div>

            <div className="bento-body">
              <p>
                Department: <strong>{emp.department || "N/A"}</strong>
              </p>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${
                    emp.status === "Online" ? "online" : "offline"
                  }`}
                  style={{ width: emp.status === "Online" ? "90%" : "40%" }}
                ></div>
              </div>
            </div>

            <div className="bento-footer">
              <button onClick={() => requestEmployee(emp)}>Request Access</button>
            </div>
          </div>
        ))}
      </div>

      <div className="toast-section">
        <h3>Requests & Sessions</h3>
        <div className="toast-container">
          {pendingRequests.map((req, idx) => (
            <div
              key={req._id || `${req.employeeId}-pending-${idx}`}
              className="toast pending-toast"
            >
              <p>
                <strong>{req.employeeId}</strong> — {req.message}
              </p>
              <span>🕓 Pending</span>
            </div>
          ))}
          {activeSessions.map((act, idx) => (
            <div
              key={act._id || `${act.employeeId}-active-${idx}`}
              className="toast active-toast"
            >
              <p>
                <strong>{act.employeeId}</strong> — {act.message}
              </p>
              <span>✅ Active</span>
            </div>
          ))}
        </div>
      </div>

      <section className="viewer">
        <h3>Live View</h3>
        <div ref={videoContainerRef} className="live-view"></div>
      </section>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Request Access</h3>
            <p>
              Send monitoring request to{" "}
              <strong>{selectedEmployee?.name || "Unnamed Employee"}</strong>
            </p>

            <label>Type</label>
            <select id="type">
              <option>Screen Share</option>
              <option>Voice</option>
              <option>Webcam</option>
            </select>

            <label>Duration (minutes)</label>
            <input id="duration" type="number" defaultValue="30" />

            <label>Reason</label>
            <input id="reason" placeholder="e.g. Code review, feedback..." />

            <div className="modal-actions">
              <button
                onClick={() => {
                  const type = document.getElementById("type").value;
                  const reason = document.getElementById("reason").value;
                  const duration = document.getElementById("duration").value;
                  sendRequest(type, reason, duration);
                }}
                className="primary"
              >
                Send
              </button>
              <button
                className="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
