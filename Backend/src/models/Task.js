const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  status: { type: String, enum: ["To Do", "In Progress", "Completed"], default: "To Do" },
  assignedTo: { type: String, required: true },  // employeeId
  assignedBy: { type: String, default: "Admin" }, // or "Self" for personal task
  dueDate: { type: Date },
  progress: { type: Number, default: 0 }, // 0-100%
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);
