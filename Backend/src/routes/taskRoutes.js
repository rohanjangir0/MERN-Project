const express = require("express");
const router = express.Router();
const {
  createTask,
  createPersonalTask,
  getTasks,
  getTasksByEmployee,
  updateTaskProgress,
  deleteTask,        // <-- import delete function
} = require("../controllers/taskController");

// Employee tasks
router.get("/employee/:employeeId", getTasksByEmployee);

// Admin tasks
router.post("/create", createTask);
router.get("/", getTasks);

// Employee personal task
router.post("/personal/create", createPersonalTask);

// Update task progress or edit personal task
router.patch("/update/:taskId", updateTaskProgress);

// Delete personal task
router.delete("/:taskId", deleteTask);

module.exports = router;
