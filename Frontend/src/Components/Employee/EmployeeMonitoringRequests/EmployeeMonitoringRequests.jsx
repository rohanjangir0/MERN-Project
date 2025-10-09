import React, { useEffect, useState, useRef } from "react";
import { Room, RoomEvent } from "livekit-client";
import { useSocket } from "../../../context/SocketContext";
import axios from "axios";
import "./EmployeeMonitoringRequests.css";

export default function EmployeeMonitoringRequests({ employeeId, employeeName }) {
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const livekitRoomRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch requests and set up socket listeners
  useEffect(() => {
    if (!employeeId || !socket) return;

    const fetchRequests = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/monitoringRequests/employee/${employeeId}`
        );
        setRequests(data || []);
      } catch (err) {
        console.error("❌ Error fetching requests:", err);
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

      // Clean up LiveKit room and stream
      if (livekitRoomRef.current) {
        livekitRoomRef.current.disconnect();
        livekitRoomRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [socket, employeeId, employeeName]);

  // Handle accepting/declining requests
  const handleResponse = async (req, status) => {
    if (!socket) return;

    socket.emit("respondMonitoringRequest", { ...req, status });
    setRequests((prev) =>
      prev.map((r) => (r._id === req._id ? { ...r, status } : r))
    );

    if (status === "accepted") await startStreaming(req);
  };

  // Start streaming to LiveKit
  const startStreaming = async (req) => {
  try {
    // Stop previous streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (livekitRoomRef.current) {
      livekitRoomRef.current.disconnect();
      livekitRoomRef.current = null;
    }

    // Get LiveKit token
    const roomName = `monitoring-${employeeId}-${req._id}`;
    const res = await fetch(
      `http://localhost:5000/api/livekit/token?room=${roomName}&identity=${employeeId}&name=${employeeName}`
    );
    const { token, url } = await res.json();
    if (!token || !url) throw new Error("Invalid LiveKit token or URL");

    // Connect to LiveKit
    const room = new Room({ adaptiveStream: true, dynacast: true });
    livekitRoomRef.current = room;
    await room.connect(url, token);

    // Request screen share first (video)
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    } catch (err) {
      console.warn("Screen share denied or audio not available:", err);
      try {
        // Try screen without audio as fallback
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      } catch (err2) {
        console.error("Screen share failed:", err2);
        alert("❌ Cannot capture screen. Make sure permission is allowed.");
        return;
      }
    }

    if (!stream || !stream.getTracks || stream.getTracks().length === 0) {
      alert("❌ No media tracks available. Check your screen sharing permissions.");
      return;
    }

    streamRef.current = stream;

    // Publish tracks, gracefully skip audio if missing
    for (const track of stream.getTracks()) {
      try {
        await room.localParticipant.publishTrack(track);
      } catch (err) {
        console.warn("Failed to publish track (skipped):", err);
      }
      // Stop stream if user ends it manually
      track.onended = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        socket.emit("stopSession", req._id);
      };
    }

    room.on(RoomEvent.Disconnected, () => console.log("Employee room disconnected"));

    console.log("✅ Screen sharing started successfully!");
  } catch (err) {
    console.error("❌ Streaming failed:", err);
    alert("Failed to start screen sharing. Check permissions or LiveKit connection.");
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
                <button onClick={() => handleResponse(req, "accepted")}>
                  ✅ Allow
                </button>
                <button onClick={() => handleResponse(req, "declined")}>
                  ❌ Deny
                </button>
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