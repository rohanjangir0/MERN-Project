// src/models/Attendance.js
const mongoose = require("mongoose");

const BreakSchema = new mongoose.Schema({
  type: { type: String, default: "Short Break" },
  start: Date,
  end: Date,
  duration: String,
});

const SessionSchema = new mongoose.Schema({
  clockIn: Date,
  clockOut: Date,
  breaks: [BreakSchema],
});

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  sessions: { type: [SessionSchema], default: [] },
  status: { type: String, default: "Absent" },
  locationIP: String,
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
