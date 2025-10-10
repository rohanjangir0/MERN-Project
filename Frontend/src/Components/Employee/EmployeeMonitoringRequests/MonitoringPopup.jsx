import React, { useEffect, useRef, useState } from "react";
import { useMonitoring } from "../../../context/MonitoringContext";
import { Room } from "livekit-client";

export default function MonitoringPopup() {
  const { latestRequest, respondRequest } = useMonitoring();
  const [allowAudio, setAllowAudio] = useState(true);
  const [allowWebcam, setAllowWebcam] = useState(true);
  const roomRef = useRef(null);

  useEffect(() => cleanupStreams, []);

  const cleanupStreams = () => {
    if (roomRef.current) {
      roomRef.current.localParticipant.tracks.forEach(pub => pub.track.stop());
      roomRef.current.disconnect();
      roomRef.current = null;
    }
  };

  const startStreaming = async (req) => {
    try {
      cleanupStreams();

      const streams = [];

      // Capture screen
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: allowAudio });
      streams.push(...displayStream.getTracks());

      // Capture webcam if allowed
      if (allowWebcam) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streams.push(...webcamStream.getTracks());
      }

      const roomName = `monitoring-${req.employeeId}-${req._id}`;
      const res = await fetch(
        `http://localhost:5000/api/livekit/token?room=${encodeURIComponent(roomName)}&identity=${req.employeeId}&name=Employee&role=employee`
      );

      const { token, url } = await res.json();

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      await room.connect(url, token);
      streams.forEach(track => room.localParticipant.publishTrack(track));

      console.log("✅ Streaming started for employee:", roomName);
    } catch (err) {
      console.error("Streaming failed:", err);
      alert("Streaming failed. Check permissions.");
    }
  };

  const handleResponse = async (status) => {
    respondRequest(latestRequest, status, allowAudio, allowWebcam);
    if (status === "accepted") await startStreaming(latestRequest);
  };

  if (!latestRequest) return null;

  return (
    <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", background: "#fff", padding: "20px", borderRadius: "12px", zIndex: 9999 }}>
      <h4>Monitoring Request</h4>
      <p>Message: {latestRequest.message || "No message"}</p>

      <label><input type="checkbox" checked={allowAudio} onChange={() => setAllowAudio(!allowAudio)} /> Share Audio</label>
      <br/>
      <label><input type="checkbox" checked={allowWebcam} onChange={() => setAllowWebcam(!allowWebcam)} /> Share Webcam</label>

      <div style={{ marginTop: "10px" }}>
        <button onClick={() => handleResponse("accepted")} style={{ marginRight: "10px" }}>✅ Accept</button>
        <button onClick={() => handleResponse("declined")}>❌ Decline</button>
      </div>
    </div>
  );
}
