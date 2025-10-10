import React, { useEffect, useRef, useState } from "react";
import { useMonitoring } from "../../../context/MonitoringContext";
import { Room } from "livekit-client";

export default function MonitoringPopup() {
  const { latestRequest, respondRequest } = useMonitoring();
  const [allowAudio, setAllowAudio] = useState(true);
  const [allowWebcam, setAllowWebcam] = useState(true);
  const roomRef = useRef(null);
  const displayStreamRef = useRef(null);
  const webcamStreamRef = useRef(null);

  // Cleanup streams on unmount
  useEffect(() => cleanupStreams, []);

  const cleanupStreams = () => {
    [displayStreamRef, webcamStreamRef].forEach((ref) => {
      if (ref.current) {
        ref.current.getTracks().forEach((t) => t.stop());
        ref.current = null;
      }
    });
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
  };

  // ---------------- Start streaming ----------------
  const startStreaming = async (req) => {
    try {
      cleanupStreams();

      // Capture screen
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: allowAudio,
      });
      displayStreamRef.current = displayStream;

      // Capture webcam if allowed
      const webcamStream = allowWebcam
        ? await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        : null;
      if (webcamStream) webcamStreamRef.current = webcamStream;

      const roomName = `monitoring-${req.employeeId}-${req._id}`;
      const res = await fetch(
        `http://localhost:5000/api/livekit/token?room=${encodeURIComponent(
          roomName
        )}&identity=${req.employeeId}&name=Employee&role=employee`
      );

      if (!res.ok) throw new Error(`Token request failed: ${res.statusText}`);
      const { token, url } = await res.json();
      if (!token || !url) throw new Error("Invalid LiveKit token or URL");

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      await room.connect(url, token);

      
      for (const track of displayStream.getTracks()) {
        await room.localParticipant.publishTrack(track);
      }
      if (webcamStream) {
        for (const track of webcamStream.getTracks()) {
          await room.localParticipant.publishTrack(track);
        }
      }

      console.log("✅ Streaming started for employee:", roomName);
    } catch (err) {
      console.error("Streaming failed:", err);
      alert("Streaming failed. Check permissions and console.");
    }
  };

  // ---------------- Handle accept/decline ----------------
  const handleResponse = async (status) => {
    respondRequest(latestRequest, status, true, allowAudio, allowWebcam);
    if (status === "accepted") await startStreaming(latestRequest);
  };

  if (!latestRequest) return null;

  // ---------------- Render popup ----------------
  return (
    <div
      style={{
        position: "fixed",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        zIndex: 9999,
        boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
        width: "320px",
        textAlign: "center",
      }}
    >
      <h4>Monitoring Request</h4>
      <p>
        <strong>{latestRequest.type}</strong> request from Admin
        <br />
        Message: {latestRequest.message || "No message"}
      </p>

      <div style={{ margin: "10px 0" }}>
        <label>
          <input
            type="checkbox"
            checked={allowAudio}
            onChange={() => setAllowAudio(!allowAudio)}
          />{" "}
          Share Audio
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={allowWebcam}
            onChange={() => setAllowWebcam(!allowWebcam)}
          />{" "}
          Share Webcam
        </label>
      </div>

      <button onClick={() => handleResponse("accepted")} style={{ marginRight: "10px" }}>
        ✅ Accept
      </button>
      <button onClick={() => handleResponse("declined")}>❌ Decline</button>
    </div>
  );
}
