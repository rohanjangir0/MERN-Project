const Task = require("../models/Task");

// ================== ADMIN TASKS ==================

// Create new task (admin)
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

// Get all tasks (admin)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// ================== EMPLOYEE TASKS ==================

// Create personal task
exports.createPersonalTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo, dueDate } = req.body;
    const task = new Task({
      title,
      description,
      priority: priority || "Medium",
      assignedTo,
      assignedBy: "Self",
      dueDate,
      status: "To Do",
      progress: 0,
      startTime: new Date(),
    });
    await task.save();
    res.status(201).json({ message: "Personal task created successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get tasks for employee
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

// Update task progress or details (personal task)
exports.updateTaskProgress = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { progress, title, description, priority } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Update progress
    if (progress !== undefined) {
      if (progress < task.progress) {
        return res.status(400).json({ message: "Cannot decrease progress" });
      }
      task.progress = progress;
      task.status = progress === 100 ? "Completed" : "In Progress";
      if (progress === 100) task.endTime = new Date();
    }

    // Update personal task details
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;

    await task.save();
    res.json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating task", error });
  }
};

// Delete personal task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Task.deleteOne({ _id: taskId });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting task", error });
  }
};
