// models/Project.js
const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectTitle: { type: String, required: true },
  projectDescription: String,
  category: String,
  budget: Number,
  timeline: String,

  // FIXED: priority is a String, not Boolean
  priority: { 
    type: String, 
    enum: ["low", "medium", "high"], 
    default: "low" 
  },

  teamSize: Number,
  coreFeatures: [String],
  integrations: [String],
  designStyle: String,
  platforms: [String],
  supportLevel: String,
  additionalNotes: String,

  status: { type: String, default: "pending" }, // pending, in-review, done, rejected
  negotiatedBudget: Number,
  dealDone: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);
