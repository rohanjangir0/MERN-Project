// SocketContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000", {
        transports: ["polling", "websocket"],
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected:", socketRef.current.id);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("⚠️ Socket disconnected:", reason);
      });

      setSocket(socketRef.current);
    }

    return () => {
      // Keep socket persistent; do not disconnect
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
