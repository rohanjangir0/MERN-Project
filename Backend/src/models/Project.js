const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectTitle: String,
  projectDescription: String,
  category: String,
  budget: Number,
  timeline: String,
  priority: String,
  teamSize: Number,
  coreFeatures: [String],
  integrations: [String],
  designStyle: String,
  platforms: [String],
  supportLevel: String,
  additionalNotes: String,
}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);
