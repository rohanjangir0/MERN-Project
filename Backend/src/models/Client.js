// models/Client.js
const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: String,
  email: { type: String, unique: true, sparse: true },
  loginId: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  forcePasswordReset: { type: Boolean, default: true },
  status: { type: String, default: "active" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin id
  resetTokenHash: String,
  resetTokenExpiry: Date,
  lastLogin: Date,
  value: Number,
  projects: Number,
}, { timestamps: true });

module.exports = mongoose.model("Client", ClientSchema);
