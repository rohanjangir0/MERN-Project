import React, { useEffect, useRef } from "react";
import { useMonitoring } from "../../../context/MonitoringContext";
import { Room } from "livekit-client";

export default function MonitoringPopup() {
  const { latestRequest, respondRequest } = useMonitoring();
  const roomRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => cleanupStream();
  }, []);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
  };

  const startStreaming = async (req) => {
    try {
      cleanupStream();

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } catch {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      }
      if (!stream) return;
      streamRef.current = stream;

      const roomName = `monitoring-${req.employeeId}-${req._id}`;
      const res = await fetch(`http://localhost:5000/api/livekit/token?room=${roomName}&identity=${req.employeeId}&name=Employee`);
      const { token, url } = await res.json();
      if (!token || !url) throw new Error("Invalid LiveKit token");

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;
      await room.connect(url, token);

      for (const track of stream.getTracks()) {
        await room.localParticipant.publishTrack(track);
        track.onended = () => cleanupStream();
      }
    } catch (err) {
      console.error("Streaming failed:", err);
      alert("Failed to start screen sharing.");
    }
  };

  if (!latestRequest) return null;

  const handleResponse = async (status) => {
    respondRequest(latestRequest, status);
    if (status === "accepted") await startStreaming(latestRequest);
  };

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
        <strong>{latestRequest.type}</strong> request from Admin<br/>
        Message: {latestRequest.message}
      </p>
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => handleResponse("accepted")} style={{ marginRight: "10px"}}>✅ Accept</button>
        <button onClick={() => handleResponse("declined")}>❌ Decline</button>
      </div>
    </div>
  );
}
