const mongoose = require("mongoose");

const MonitoringRequestSchema = new mongoose.Schema({
  adminId: String,
  employeeId: String,
  type: String, // Screen / Voice / Webcam
  message: String,
  status: { type: String, default: "pending" }, // pending/accepted/declined
  createdAt: { type: Date, default: Date.now },
  respondedAt: Date,
});

module.exports = mongoose.model("MonitoringRequest", MonitoringRequestSchema);
