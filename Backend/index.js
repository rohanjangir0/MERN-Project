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

// ✅ Serve uploaded files from backend/uploads
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

// Models
const Message = require("./src/models/Message");

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Attach socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // change to your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Track online users
let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ New connection:", socket.id);

  // Register user when they connect
  socket.on("register", (user) => {
    onlineUsers.set(user.id, socket.id);
    io.emit("userList", Array.from(onlineUsers.keys())); // broadcast online users
  });

  // Handle sending messages
  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, text } = data;

    try {
      // ✅ Save to MongoDB
      const newMsg = new Message({ senderId, receiverId, text });
      await newMsg.save();

      // ✅ Emit to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", newMsg);
      }

      // ✅ Emit back to sender (so sender UI updates instantly)
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", newMsg);
      }
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("userList", Array.from(onlineUsers.keys()));
    console.log("❌ Disconnected:", socket.id);
  });
});

// REST API routes
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Connect DB & start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
