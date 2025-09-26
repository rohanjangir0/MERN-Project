const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: String,
  department: String,
  leaveType: { type: String, enum: ["Annual", "Sick", "Personal"], default: "Annual" },
  startDate: Date,
  endDate: Date,
  duration: Number,
  reason: String,
  appliedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
  adminRemark: String
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveSchema);
