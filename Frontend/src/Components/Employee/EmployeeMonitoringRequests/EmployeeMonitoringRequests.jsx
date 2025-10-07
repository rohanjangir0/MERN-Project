import React, { useEffect, useState, useRef } from "react";
import { Room } from "livekit-client";
import { useSocket } from "../../../context/SocketContext";
import axios from "axios";
import "./EmployeeMonitoringRequests.css";

export default function EmployeeMonitoringRequests({ employeeId, employeeName }) {
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const livekitRoomRef = useRef(null);

  useEffect(() => {
    if (!employeeId || !socket) return;

    const fetchRequests = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/monitoringRequests/employee/${employeeId}`
        );
        setRequests(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    socket.emit("employeeOnline", { id: employeeId, name: employeeName || "Employee" });

    socket.on("receiveMonitoringRequest", (req) => {
      setRequests((prev) => (prev.some((r) => r._id === req._id) ? prev : [...prev, req]));
    });

    socket.on("requestResponse", (updatedReq) => {
      setRequests((prev) =>
        prev.map((r) => (r._id === updatedReq._id ? updatedReq : r))
      );
    });

    return () => {
      socket.off("receiveMonitoringRequest");
      socket.off("requestResponse");
    };
  }, [socket, employeeId, employeeName]);

  const handleResponse = async (req, status) => {
    if (!socket) return;

    socket.emit("respondMonitoringRequest", { ...req, status });

    setRequests((prev) =>
      prev.map((r) => (r._id === req._id ? { ...r, status } : r))
    );

    if (status === "accepted") await startStreaming(req);
  };

  const startStreaming = async (req) => {
    try {
      const roomName = `monitoring-${employeeId}-${req._id}`;
      const res = await fetch(
        `http://localhost:5000/api/livekit/token?room=${roomName}&identity=${employeeId}&name=${employeeName}`
      );
      const { token, url } = await res.json();

      const room = new Room();
      livekitRoomRef.current = room;
      await room.connect(url, token);

      let stream;
      if (req.type === "Screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else if (req.type === "Voice") {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } else if (req.type === "Webcam") {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      }

      for (const track of stream.getTracks()) {
        await room.localParticipant.publishTrack(track);
      }

      const stopHandler = () => {
        room.disconnect();
        livekitRoomRef.current = null;
        socket.emit("stopSession", req._id);
      };

      if (stream.getTracks().length > 0) {
        stream.getTracks().forEach(track => {
        track.onended = stopHandler;
        });
      }

    } catch (err) {
      console.error("❌ Streaming failed:", err);
    }
  };

  if (loading) return <p>Loading monitoring requests...</p>;

  return (
    <div className="monitor-requests">
      <h2>Incoming Monitoring Requests</h2>
      {requests.length === 0 ? (
        <p>No new requests.</p>
      ) : (
        requests.map((req) => (
          <div key={req._id} className={`req-card ${req.status}`}>
            <div className="req-info">
              <h4>{req.type} Request</h4>
              <p>{req.message}</p>
            </div>
            {req.status === "pending" ? (
              <div className="req-actions">
                <button onClick={() => handleResponse(req, "accepted")}>✅ Allow</button>
                <button onClick={() => handleResponse(req, "declined")}>❌ Deny</button>
              </div>
            ) : (
              <p>Status: {req.status}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
