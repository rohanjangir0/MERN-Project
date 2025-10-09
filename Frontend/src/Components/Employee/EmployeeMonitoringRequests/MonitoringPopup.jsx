import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../../../context/SocketContext";
import { Room, RoomEvent } from "livekit-client";

export default function MonitoringPopup() {
  const { socket } = useSocket();
  const [request, setRequest] = useState(null);
  const roomRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming requests from admin
    socket.on("receiveMonitoringRequest", (req) => {
      setRequest(req); // show popup
    });

    return () => {
      socket.off("receiveMonitoringRequest");
      cleanupStream();
    };
  }, [socket]);

  const cleanupStream = () => {
    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    // Disconnect room
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
  };

  const startStreaming = async (req) => {
    try {
      cleanupStream();

      // Get screen share
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } catch (err) {
        try {
          stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        } catch (err2) {
          alert("❌ Cannot capture screen. Allow screen sharing permissions.");
          return;
        }
      }
      if (!stream) return;
      streamRef.current = stream;

      // Get LiveKit token
      const roomName = `monitoring-${req.employeeId}-${req._id}`;
      const res = await fetch(
        `http://localhost:5000/api/livekit/token?room=${roomName}&identity=${req.employeeId}&name=Employee`
      );
      const { token, url } = await res.json();
      if (!token || !url) throw new Error("Invalid LiveKit token or URL");

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;
      await room.connect(url, token);

      // Publish tracks
      for (const track of stream.getTracks()) {
        await room.localParticipant.publishTrack(track);
        track.onended = () => {
          socket.emit("stopSession", req._id);
          cleanupStream();
        };
      }

      console.log("✅ Screen sharing started!");
    } catch (err) {
      console.error("❌ Streaming failed:", err);
      alert("Failed to start screen sharing. Check permissions or LiveKit connection.");
    }
  };

  const respond = async (status) => {
    if (!socket || !request) return;
    socket.emit("respondMonitoringRequest", { ...request, status });

    if (status === "accepted") {
      await startStreaming(request);
    }

    setRequest(null); // close popup
  };

  if (!request) return null;

  return (
    <div style={{
      position: "fixed",
      top: "20%",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#fff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
      zIndex: 9999,
      width: "321px",
      textAlign: "center"
    }}>
      <h4>Monitoring Request</h4>
      <p>
        <strong>{request.type}</strong> request from Admin<br/>
        Message: {request.message}
      </p>
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => respond("accepted")} style={{ marginRight: "10px" }}>✅ Accept</button>
        <button onClick={() => respond("declined")}>❌ Decline</button>
      </div>
    </div>
  );
}
