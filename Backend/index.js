const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import routes
const authRouter = require("./src/routes/auth");
const leavesRouter = require("./src/routes/leaves");
const employeeRoutes = require("./src/routes/employeeRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const announcementRoutes = require("./src/routes/announcementRoutes");
const userRoutes = require("./src/routes/users");
const messageRoutes = require("./src/routes/message");
const adminLeaveRoutes = require("./src/routes/adminLeaveRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const documentRoutes = require("./src/routes/documentRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const ticketRoutes = require("./src/routes/ticketRoutes");
const monitoringRoutes = require("./src/routes/monitoringRequests");

// Models
const Message = require("./src/models/Message");
const MonitoringRequest = require("./src/models/MonitoringRequest");

// Register API routes
app.use("/api/auth", authRouter);
app.use("/api/leaves", leavesRouter);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin/leaves", adminLeaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/monitoringRequests", monitoringRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ---------------- Real-Time Monitoring ----------------
const onlineUsers = new Map(); // userId => { socketId, name, status, screen, voice, webcam }
let activeSessions = []; // Active sessions

io.on("connection", (socket) => {
  console.log("✅ New connection:", socket.id);

  // User comes online
  socket.on("employeeOnline", async (user) => {
    onlineUsers.set(user.id, {
      socketId: socket.id,
      userId: user.id,
      name: user.name,
      status: "Active",
      screen: false,
      voice: false,
      webcam: false,
    });

    // Send all pending requests to this user
    const pending = await MonitoringRequest.find({
      $or: [{ employeeId: user.id }, { adminId: user.id }],
      status: "pending",
    });
    pending.forEach((r) => socket.emit("receiveMonitoringRequest", r));

    // Emit updated online users to everyone
    io.emit("onlineEmployees", Array.from(onlineUsers.values()));
  });

  // Admin sends monitoring request
  // Admin sends monitoring request
socket.on("sendMonitoringRequest", async (req) => {
  try {
    const newReq = await MonitoringRequest.create(req);

    // Emit to employee even if not online (will be received on fetch)
    const empSocketId = onlineUsers.get(req.employeeId)?.socketId;
    if (empSocketId) {
      io.to(empSocketId).emit("receiveMonitoringRequest", newReq);
    }

    // Emit pending requests to all admins
    for (let [userId, info] of onlineUsers.entries()) {
      if (userId.startsWith("admin")) {
        const pending = await MonitoringRequest.find({ adminId: info.userId, status: "pending" });
        io.to(info.socketId).emit("pendingRequests", pending);
      }
    }
  } catch (err) {
    console.error("❌ Error sending monitoring request:", err);
  }
});


  // Employee responds to request
  socket.on("respondMonitoringRequest", async (res) => {
    try {
      const updated = await MonitoringRequest.findByIdAndUpdate(
        res.id,
        { status: res.status, respondedAt: new Date() },
        { new: true }
      );

      // Notify admin
      const adminSocketId = onlineUsers.get(res.adminId)?.socketId;
      if (adminSocketId) io.to(adminSocketId).emit("requestResponse", updated);

      // If accepted, create active session
      if (res.status === "accepted") {
        const session = {
          id: Date.now(),
          employeeId: res.employeeId,
          adminId: res.adminId,
          type: res.type,
          startedAt: new Date().toLocaleTimeString(),
        };
        activeSessions.push(session);
        io.emit("activeSessions", activeSessions);
      }
    } catch (err) {
      console.error("❌ Error responding to request:", err);
    }
  });

  // Stop session
  socket.on("stopSession", (sessionId) => {
    activeSessions = activeSessions.filter((s) => s.id !== sessionId);
    io.emit("activeSessions", activeSessions);
  });

  // Update screen/voice/webcam status
  socket.on("updateStatus", ({ userId, screen, voice, webcam }) => {
    if (onlineUsers.has(userId)) {
      const user = onlineUsers.get(userId);
      user.screen = screen;
      user.voice = voice;
      user.webcam = webcam;
      onlineUsers.set(userId, user);
      io.emit("onlineEmployees", Array.from(onlineUsers.values()));
    }
  });

  // Chat messages
  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, text } = data;
    try {
      const newMsg = new Message({ senderId, receiverId, text });
      await newMsg.save();

      const receiverSocket = onlineUsers.get(receiverId)?.socketId;
      if (receiverSocket) io.to(receiverSocket).emit("receiveMessage", newMsg);

      const senderSocket = onlineUsers.get(senderId)?.socketId;
      if (senderSocket) io.to(senderSocket).emit("receiveMessage", newMsg);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (let [userId, info] of onlineUsers.entries()) {
      if (info.socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("onlineEmployees", Array.from(onlineUsers.values()));
    console.log("❌ Disconnected:", socket.id);
  });
});

// Connect DB & start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
