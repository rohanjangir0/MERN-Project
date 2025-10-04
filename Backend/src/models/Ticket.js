const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, default: "Open" }, // Open, In Progress, Resolved
  description: { type: String, required: true },
  files: [String], // store file URLs
  submittedAt: { type: Date, default: Date.now },
  assignee: { type: String, default: "Unassigned" }
});

module.exports = mongoose.model("Ticket", ticketSchema);
