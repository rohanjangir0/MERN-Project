const Task = require("../models/Task");

// Create new task
exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get all tasks (for admin dashboard)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get tasks by employeeId
exports.getTasksByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const tasks = await Task.find({ assignedTo: employeeId });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};
