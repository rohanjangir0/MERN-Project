// models/MonitoringRequest.js
const mongoose = require("mongoose");

const MonitoringRequestSchema = new mongoose.Schema({
  adminId: String,
  employeeId: String,
  type: { type: String, default: "Screen" }, 
  message: String,
  allowScreen: { type: Boolean, default: true },
  allowAudio: { type: Boolean, default: false },
  allowWebcam: { type: Boolean, default: false },
  status: { type: String, default: "pending" }, 
  createdAt: { type: Date, default: Date.now },
  respondedAt: Date,
});

module.exports = mongoose.model("MonitoringRequest", MonitoringRequestSchema);
