import React, { useEffect, useRef, useState } from "react";
import { useMonitoring } from "../../../context/MonitoringContext";
import { Room } from "livekit-client";

export default function MonitoringPopup() {
  const { latestRequest, respondRequest } = useMonitoring();
  const [allowAudio, setAllowAudio] = useState(true);
  const [allowWebcam, setAllowWebcam] = useState(true);
  const [allowScreen, setAllowScreen] = useState(true); // ✅ new toggle
  const roomRef = useRef(null);

  useEffect(() => {
    return cleanupStreams; // ✅ proper cleanup in unmount
  }, []);

  const cleanupStreams = () => {
    try {
      if (roomRef.current) {
        const participant = roomRef.current.localParticipant;
        if (participant?.tracks) {
          participant.tracks.forEach(pub => {
            if (pub.track) pub.track.stop();
          });
        }
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    } catch (err) {
      console.warn("Cleanup error:", err);
    }
  };

  const startStreaming = async (req) => {
    try {
      cleanupStreams();

      const tracks = [];

      // ✅ Step 1: Optional Screen Share
      if (allowScreen) {
        console.log("Requesting screen share...");
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: allowAudio,
        });
        tracks.push(...displayStream.getTracks());
        console.log("✅ Screen stream captured.");
      }

      // ✅ Step 2: Delay before webcam
      await new Promise((res) => setTimeout(res, 500));

      // ✅ Step 3: Optional Webcam
      if (allowWebcam) {
        console.log("Requesting webcam access...");
        const webcamStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: !allowScreen && allowAudio, // only audio if screen not shared
        });
        tracks.push(...webcamStream.getTracks());
        console.log("✅ Webcam stream captured.");
      }

      // ✅ Step 4: Connect to LiveKit
      const roomName = `monitoring-${req.employeeId}-${req._id}`;
      const res = await fetch(
        `http://localhost:5000/api/livekit/token?room=${encodeURIComponent(roomName)}&identity=${req.employeeId}&name=Employee&role=employee`
      );

      const { token, url } = await res.json();
      if (!token || !url) throw new Error("Invalid LiveKit token or URL");

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      await room.connect(url, token);
      console.log("✅ Connected to LiveKit:", roomName);

      // ✅ Step 5: Publish all tracks
      for (const track of tracks) {
        await room.localParticipant.publishTrack(track);
      }

      console.log("✅ Streaming started successfully:", roomName);
    } catch (err) {
      console.error("Streaming failed:", err);
      alert(`Streaming failed. Check permissions or HTTPS.\nError: ${err.message}`);
    }
  };

  const handleResponse = async (status) => {
    respondRequest(latestRequest, status, allowAudio, allowWebcam);
    if (status === "accepted") await startStreaming(latestRequest);
  };

  if (!latestRequest) return null;

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
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      }}
    >
      <h4>Monitoring Request</h4>
      <p>Message: {latestRequest.message || "No message"}</p>

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
      <br />
      <label>
        <input
          type="checkbox"
          checked={allowScreen}
          onChange={() => setAllowScreen(!allowScreen)}
        />{" "}
        Share Screen
      </label>

      <div style={{ marginTop: "10px" }}>
        <button
          onClick={() => handleResponse("accepted")}
          style={{ marginRight: "10px" }}
        >
          ✅ Accept
        </button>
        <button onClick={() => handleResponse("declined")}>❌ Decline</button>
      </div>
    </div>
  );
}
