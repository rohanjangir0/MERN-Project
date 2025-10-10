import React, { useEffect, useRef, useState } from "react";
import { useMonitoring } from "../../../context/MonitoringContext";
import { Room } from "livekit-client";

export default function MonitoringPopup() {
  const { latestRequest, respondRequest } = useMonitoring();
  const [allowAudio, setAllowAudio] = useState(true);
  const [allowWebcam, setAllowWebcam] = useState(true);
  const [allowScreen, setAllowScreen] = useState(true);
  const roomRef = useRef(null);

  // Cleanup tracks and disconnect on unmount
  useEffect(() => {
    return () => cleanupStreams();
  }, []);

  const cleanupStreams = () => {
    try {
      if (roomRef.current) {
        const participant = roomRef.current.localParticipant;
        participant?.tracks?.forEach(pub => pub.track?.stop());
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

      // SCREEN SHARE (optional)
      if (allowScreen) {
        // Ask only for video first (audio separately to avoid conflicts)
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        tracks.push(...displayStream.getTracks());

        // Optional screen audio
        if (allowAudio) {
          const audioTracks = displayStream.getAudioTracks();
          if (audioTracks.length) tracks.push(...audioTracks);
        }
        console.log("✅ Screen stream captured");
      }

      // Delay before webcam request (required in Chrome)
      await new Promise((res) => setTimeout(res, 300));

      // WEBCAM (optional)
      if (allowWebcam) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false, // do not conflict with screen audio
        });
        tracks.push(...webcamStream.getTracks());
        console.log("✅ Webcam stream captured");
      }

      // CONNECT TO LIVEKIT
      const roomName = `monitoring-${req.employeeId}-${req._id}`;
      const res = await fetch(
        `https://localhost:5000/api/livekit/token?room=${encodeURIComponent(
          roomName
        )}&identity=${req.employeeId}&name=Employee&role=employee`
      );
      const { token, url } = await res.json();
      if (!token || !url) throw new Error("Invalid LiveKit token or URL");

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      await room.connect(url, token);
      console.log("✅ Connected to LiveKit:", roomName);

      // Publish tracks
      for (const track of tracks) {
        await room.localParticipant.publishTrack(track);
      }

      console.log("✅ Streaming started successfully");
    } catch (err) {
      console.error("Streaming failed:", err);
      alert(
        `Streaming failed. Make sure you allowed permissions and are on HTTPS.\nError: ${err.message}`
      );
    }
  };

  const handleResponse = async (status) => {
    respondRequest(latestRequest, status, allowAudio, allowWebcam);
    if (status === "accepted") {
      // Only trigger streaming after user click (required by browser)
      await startStreaming(latestRequest);
    }
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
