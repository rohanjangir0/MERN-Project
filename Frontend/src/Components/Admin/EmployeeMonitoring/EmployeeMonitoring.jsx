import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../context/SocketContext";
import { Room, RoomEvent } from "livekit-client";
import "./EmployeeMonitoring.css";

export default function EmployeeMonitoring() {
  const { socket } = useSocket();
  const [employees, setEmployees] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef(null);
  const roomRef = useRef(null);
  const currentTrackRef = useRef(null);

  const adminId = "admin-1"; // replace with dynamic ID if needed

  // ---------------- Socket setup ----------------
  useEffect(() => {
    if (!socket) return;

    console.log("✅ Socket connected:", socket.id);

    fetchInitialData();

    socket.emit("employeeOnline", { id: adminId, name: "Admin" });

    socket.on("onlineEmployees", handleOnline);
    socket.on("pendingRequests", setPendingRequests);
    socket.on("requestResponse", handleRequestResponse);

    return () => {
      socket.off("onlineEmployees", handleOnline);
      socket.off("pendingRequests", setPendingRequests);
      socket.off("requestResponse", handleRequestResponse);
      disconnectRoom();
    };
  }, [socket]);

  // ---------------- Fetch employees & requests ----------------
  const fetchInitialData = async () => {
    try {
      const empRes = await fetch("http://localhost:5000/api/employees");
      const empData = await empRes.json();
      setEmployees(empData);

      const reqRes = await fetch(`http://localhost:5000/api/monitoringRequests/admin/${adminId}`);
      const reqData = await reqRes.json();
      setPendingRequests(reqData);

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    }
  };

  const handleOnline = (list) => {
    setEmployees(prev =>
      prev.map(emp => ({
        ...emp,
        status: list.some(e => e.userId === emp.employeeId) ? "Online" : "Offline"
      }))
    );
  };

  const handleRequestResponse = (req) => {
    setPendingRequests(prev => prev.map(r => r._id === req._id ? { ...r, status: req.status } : r));

    if (req.status === "accepted") startViewing(req);
  };

  // ---------------- LiveKit viewing ----------------
  const disconnectRoom = () => {
    if (currentTrackRef.current) currentTrackRef.current.detach();
    if (roomRef.current) roomRef.current.disconnect();
    if (videoRef.current) videoRef.current.innerHTML = "";
    currentTrackRef.current = null;
    roomRef.current = null;
  };

  const startViewing = async (req) => {
  try {
    disconnectRoom();

    const roomName = `monitoring-${req.employeeId}-${req._id}`;
    const res = await fetch(
      `http://localhost:5000/api/livekit/token?room=${encodeURIComponent(roomName)}&identity=${adminId}&name=Admin&role=admin`
    );
    const { token, url } = await res.json();
    if (!token || !url) throw new Error("Invalid LiveKit token or URL");

    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    // Attach listeners first
    room.on(RoomEvent.TrackSubscribed, attachTrack);
    room.on(RoomEvent.TrackUnsubscribed, detachTrack);
    room.on(RoomEvent.Disconnected, () => {
      console.warn("🔴 Disconnected from LiveKit room.");
      detachTrack();
    });

    console.log("Connecting to LiveKit:", url, "room:", roomName);
    await room.connect(url, token);
    console.log("✅ Connected to employee stream:", roomName);

    // ✅ Safely check before looping participants
    if (room.participants && room.participants.size > 0) {
      for (const participant of room.participants.values()) {
        if (!participant.tracks) continue;
        for (const publication of participant.tracks.values()) {
          if (publication.isSubscribed && publication.track) {
            attachTrack(publication.track);
          } else {
            publication.on("subscribed", attachTrack);
          }
        }
      }
    } else {
      console.warn("No participants yet — waiting for employee to publish tracks.");
    }

  } catch (err) {
    console.error("❌ Failed to connect or render video:", err);
    alert("Failed to connect. Check console for details.");
  }
};


  const attachTrack = (track) => {
    if (!track || !videoRef.current) return;
    detachTrack();

    const el = track.attach();
    el.style.width = "100%";
    el.style.borderRadius = "16px";
    videoRef.current.innerHTML = "";
    videoRef.current.appendChild(el);
    currentTrackRef.current = track;
  };

  const detachTrack = () => {
    if (currentTrackRef.current) currentTrackRef.current.detach();
    if (videoRef.current) videoRef.current.innerHTML = "<p class='disconnected'>🔴 Stream ended</p>";
    currentTrackRef.current = null;
  };

  const sendMonitoringRequest = (employeeId) => {
    if (!socket) return;
    const request = {
      employeeId,
      adminId,
      type: "screen",
      status: "pending",
      message: "Please share your screen and audio for monitoring."
    };
    socket.emit("sendMonitoringRequest", request);
    setPendingRequests(prev => [...prev, { ...request, _id: Date.now() }]);
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="monitoring-dashboard">
      <h1>Employee Monitoring Center</h1>

      <div className="bento-grid">
        {employees.map(emp => (
          <div key={emp.employeeId} className={`bento-card ${emp.status?.toLowerCase() || "offline"}`}>
            <h3>{emp.name}</h3>
            <p>Status: {emp.status || "Offline"}</p>
            <button
              onClick={() => sendMonitoringRequest(emp.employeeId)}
              disabled={emp.status !== "Online"}
            >
              Request Monitoring
            </button>
          </div>
        ))}
      </div>

      <section className="pending-requests">
        <h3>Pending Requests</h3>
        {pendingRequests.length === 0 ? <p>No pending requests</p> :
          pendingRequests.map(req => (
            <div key={req._id} className="request-card">
              <p>Employee: {req.employeeId}</p>
              <p>Type: {req.type}</p>
              <p>Status: {req.status}</p>
            </div>
          ))
        }
      </section>

      <section className="viewer">
        <h3>Live View</h3>
        <div ref={videoRef} className="live-view">
          <p className="disconnected">🔴 Waiting for employee...</p>
        </div>
      </section>
    </div>
  );
}
