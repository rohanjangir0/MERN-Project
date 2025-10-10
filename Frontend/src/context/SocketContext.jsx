import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("disconnected");

  useEffect(() => {
    if (!socketRef.current) {
      setStatus("connecting");
      socketRef.current = io("http://localhost:5000", {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });
      const s = socketRef.current;

      s.on("connect", () => setStatus("connected"));
      s.on("disconnect", () => setStatus("disconnected"));
      s.on("connect_error", () => setStatus("disconnected"));
      s.on("reconnect_attempt", () => setStatus("reconnecting"));
      s.on("reconnect_failed", () => setStatus("disconnected"));

      setSocket(s);
    }
  }, []);

  return <SocketContext.Provider value={{ socket, status }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
