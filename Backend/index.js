const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

dotenv.config();
const app = express();

// ---------------- Middleware ----------------
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------- Import Routes ----------------
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

// ---------------- Models ----------------
const Message = require("./src/models/Message");
const MonitoringRequest = require("./src/models/MonitoringRequest");
const livekitRouter = require("./src/routes/livekit");
app.use("/api/livekit", livekitRouter);

// ---------------- Register API routes ----------------
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

// ---------------- HTTP & Socket.IO Server ----------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ---------------- Real-Time Monitoring ----------------
// Map userId => array of connections
const onlineUsers = new Map(); // userId => [{ socketId, name, status, screen, voice, webcam }]
let activeSessions = [];       // Active monitoring sessions

io.on("connection", (socket) => {
  console.log("✅ New connection:", socket.id);

  // ---------------- Employee/Admin Online ----------------
  socket.on("employeeOnline", async (user) => {
    const conns = onlineUsers.get(user.id) || [];
    conns.push({
      socketId: socket.id,
      name: user.name,
      status: "Active",
      screen: false,
      voice: false,
      webcam: false,
    });
    onlineUsers.set(user.id, conns);

    // Send pending monitoring requests to employee
    if (!user.id.startsWith("admin")) {
      const pending = await MonitoringRequest.find({
        employeeId: user.id,
        status: "pending",
      });
      pending.forEach((r) => socket.emit("receiveMonitoringRequest", r));
    }

    // Broadcast all online users to all clients
    io.emit(
      "onlineEmployees",
      Array.from(onlineUsers.entries()).flatMap(([id, conns]) =>
        conns.map((c) => ({ userId: id, ...c }))
      )
    );
  });

  // ---------------- Admin Sends Monitoring Request ----------------
  // When admin sends monitoring request
socket.on("sendMonitoringRequest", async (req) => {
  try {
    // req.employeeId now comes from employee.employeeId
    const newReq = await MonitoringRequest.create(req);

    // Send to employee if online
    if (onlineUsers.has(req.employeeId)) {
      onlineUsers.get(req.employeeId).forEach((c) =>
        io.to(c.socketId).emit("receiveMonitoringRequest", newReq)
      );
    }

    // Notify all admins about pending requests
    for (let [userId, conns] of onlineUsers.entries()) {
      if (userId.startsWith("admin")) {
        const pending = await MonitoringRequest.find({
          adminId: userId,
          status: "pending",
        });
        conns.forEach((c) => io.to(c.socketId).emit("pendingRequests", pending));
      }
    }
  } catch (err) {
    console.error("❌ Error sending monitoring request:", err);
  }
});


  // ---------------- Employee Responds ----------------
  socket.on("respondMonitoringRequest", async (res) => {
    try {
      const updated = await MonitoringRequest.findByIdAndUpdate(
        res._id,
        { status: res.status, respondedAt: new Date() },
        { new: true }
      );

      // Notify admin
      if (onlineUsers.has(res.adminId)) {
        onlineUsers.get(res.adminId).forEach((c) =>
          io.to(c.socketId).emit("requestResponse", updated)
        );
      }

      // Start session if accepted
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
      console.error(err);
    }
  });

  // ---------------- Stop Session ----------------
  socket.on("stopSession", (sessionId) => {
    activeSessions = activeSessions.filter((s) => s.id !== sessionId);
    io.emit("activeSessions", activeSessions);
  });

  // ---------------- Update Employee Status ----------------
  socket.on("updateStatus", ({ userId, screen, voice, webcam }) => {
    if (onlineUsers.has(userId)) {
      const conns = onlineUsers.get(userId);
      conns.forEach((c) => {
        c.screen = screen;
        c.voice = voice;
        c.webcam = webcam;
      });
      onlineUsers.set(userId, conns);

      io.emit(
        "onlineEmployees",
        Array.from(onlineUsers.entries()).flatMap(([id, conns]) =>
          conns.map((c) => ({ userId: id, ...c }))
        )
      );
    }
  });

  // ---------------- Chat Messages ----------------
  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, text } = data;
    try {
      const newMsg = new Message({ senderId, receiverId, text });
      await newMsg.save();

      if (onlineUsers.has(receiverId)) {
        onlineUsers.get(receiverId).forEach((c) =>
          io.to(c.socketId).emit("receiveMessage", newMsg)
        );
      }
      if (onlineUsers.has(senderId)) {
        onlineUsers.get(senderId).forEach((c) =>
          io.to(c.socketId).emit("receiveMessage", newMsg)
        );
      }
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  // ---------------- Disconnect ----------------
  socket.on("disconnect", () => {
    for (let [userId, conns] of onlineUsers.entries()) {
      const remaining = conns.filter((c) => c.socketId !== socket.id);
      if (remaining.length === 0) onlineUsers.delete(userId);
      else onlineUsers.set(userId, remaining);
    }

    io.emit(
      "onlineEmployees",
      Array.from(onlineUsers.entries()).flatMap(([id, conns]) =>
        conns.map((c) => ({ userId: id, ...c }))
      )
    );
    console.log("❌ Disconnected:", socket.id);
  });
});

// ---------------- Connect to MongoDB & Start Server ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
