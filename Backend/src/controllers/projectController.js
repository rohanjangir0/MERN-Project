const Project = require("../models/Project");

// ✅ Create a new project request
exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ✅ Get all project requests (Admin view)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ✅ Update project (negotiate budget, mark deal done, change status)
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // e.g., { negotiatedBudget: 75000, dealDone: true }

    const project = await Project.findByIdAndUpdate(id, updateData, { new: true });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
