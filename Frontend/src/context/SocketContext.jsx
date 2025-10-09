// SocketContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("disconnected"); // disconnected | connecting | connected | reconnecting

  useEffect(() => {
    if (!socketRef.current) {
      setStatus("connecting");

      // Initialize socket
      socketRef.current = io("http://localhost:5000", {
        transports: ["websocket"], // Use only websocket
        reconnection: true,
        reconnectionAttempts: Infinity, // Keep trying until success
        reconnectionDelay: 1000,       // Start with 1s delay
        reconnectionDelayMax: 5000,    // Max delay 5s
        timeout: 20000,                // 20s connection timeout
      });

      const s = socketRef.current;

      s.on("connect", () => {
        console.log("✅ Socket connected:", s.id);
        setStatus("connected");
      });

      s.on("disconnect", (reason) => {
        console.warn("⚠️ Socket disconnected:", reason);
        setStatus("disconnected");
      });

      s.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
        setStatus("disconnected");
      });

      s.on("reconnect_attempt", (attempt) => {
        console.log(`🔄 Reconnection attempt #${attempt}`);
        setStatus("reconnecting");
      });

      s.on("reconnect_failed", () => {
        console.error("❌ Reconnection failed. Check server or network.");
        setStatus("disconnected");
      });

      setSocket(s);
    }

    return () => {
      // Keep socket persistent; do not disconnect on unmount
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, status }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
