const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  clockIn: { type: Date, default: null },   // store Date object
  clockOut: { type: Date, default: null },  // store Date object
  totalHours: { type: String, default: "0h 0m" },
  breaks: [
    {
      type: { type: String }, // Lunch, Coffee etc
      start: Date,
      end: Date,
      duration: String
    }
  ],
  status: { type: String, enum: ["Present", "Late", "Leave", "Auto Logged Out"], default: "Present" },
  locationIP: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
