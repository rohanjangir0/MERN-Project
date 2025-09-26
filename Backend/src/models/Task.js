const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  status: { type: String, enum: ["To Do", "In Progress", "Completed"], default: "To Do" },
  project: { type: String, default: "General" },
  assignedTo: { type: String, required: true },  // employeeId
  assignedBy: { type: String, default: "Admin" },
  dueDate: { type: Date },
  estimatedTime: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);
