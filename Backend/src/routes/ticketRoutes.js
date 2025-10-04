const express = require("express");
const router = express.Router();
const {
  createTask,
  createPersonalTask,
  getTasks,
  getTasksByEmployee,
  updateTaskProgress,
  deleteTask,
} = require("../controllers/taskController");

// ================== EMPLOYEE TASKS ==================
router.get("/employee/:employeeId", getTasksByEmployee);
router.post("/personal/create", createPersonalTask);
router.patch("/update/:taskId", updateTaskProgress);
router.delete("/:taskId", deleteTask);

// ================== ADMIN TASKS ==================
router.post("/create", createTask);
router.get("/", getTasks);

module.exports = router;
