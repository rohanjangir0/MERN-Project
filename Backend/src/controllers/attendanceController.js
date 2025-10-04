// src/controllers/attendanceController.js
const Attendance = require("../models/Attendance");

// Helper to calculate total hours for all sessions minus breaks
const calculateTotalHours = (sessions = []) => {
  let totalMs = 0;
  let breakMs = 0;

  sessions.forEach(s => {
    if (s.clockIn && s.clockOut) totalMs += new Date(s.clockOut) - new Date(s.clockIn);
    s.breaks?.forEach(b => {
      if (b.start && b.end) breakMs += new Date(b.end) - new Date(b.start);
    });
  });

  const workedMs = totalMs - breakMs;
  const hours = Math.floor(workedMs / 3600000);
  const minutes = Math.floor((workedMs % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

// Clock in / Clock out
exports.clock = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const ip = req.body.ip || "Unknown IP";

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let record = await Attendance.findOne({ user: userId, date: { $gte: todayStart } });

    // Create new attendance record if none exists today
    if (!record) {
      record = new Attendance({
        user: userId,
        date: new Date(),
        sessions: [{ clockIn: new Date(), breaks: [] }],
        status: "Present",
        locationIP: ip,
      });
      record.totalHours = calculateTotalHours(record.sessions);
      await record.save();
      return res.json({ message: "Clocked in successfully", record });
    }

    // Ensure sessions array exists
    record.sessions = record.sessions || [];
    const lastSession = record.sessions[record.sessions.length - 1];

    // Clock out current session if it's active
    if (lastSession && !lastSession.clockOut) {
      lastSession.clockOut = new Date();
      record.status = "Present";
      record.totalHours = calculateTotalHours(record.sessions);
      await record.save();
      return res.json({ message: "Clocked out successfully", record });
    }

    // Limit to max 3 sessions per day
    if (record.sessions.length >= 3) {
      return res.status(400).json({ message: "Maximum 3 clock-ins/out per day reached" });
    }

    // Start new session
    record.sessions.push({ clockIn: new Date(), breaks: [] });
    record.status = "Present";
    record.totalHours = calculateTotalHours(record.sessions);
    await record.save();
    return res.json({ message: "Clocked in successfully", record });

  } catch (err) {
    console.error("Clock error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Record a break
exports.break = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const { type, start, end } = req.body;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({ user: userId, date: { $gte: todayStart } });
    if (!record || !record.sessions?.length) {
      return res.status(400).json({ message: "No active session to take break" });
    }

    const lastSession = record.sessions[record.sessions.length - 1];
    lastSession.breaks = lastSession.breaks || [];

    const startTime = start ? new Date(start) : new Date();
    const endTime = end ? new Date(end) : new Date();
    const durationMs = endTime - startTime;
    const duration = `${Math.floor(durationMs / 60000)}m`;

    lastSession.breaks.push({ type, start: startTime, end: endTime, duration });
    record.totalHours = calculateTotalHours(record.sessions);

    await record.save();
    res.json({ message: "Break recorded", record });

  } catch (err) {
    console.error("Break error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get history
exports.history = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const records = await Attendance.find({ user: userId }).sort({ date: -1 });
    res.json(records);

  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
