const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  name: String,
  category: { type: String, default: "Uncategorized" },
  size: String,
  uploaded: { type: Date, default: Date.now },
  status: { type: String, default: "Processing" }, // Admin can approve later
  employeeId: String, // Which employee uploaded
  path: String,       // Path to file for download
});

module.exports = mongoose.model("Document", documentSchema);
