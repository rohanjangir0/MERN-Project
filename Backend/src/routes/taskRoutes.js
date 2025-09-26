const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTasksByEmployee,
} = require("../controllers/taskController");

// Employee tasks
router.get("/employee/:employeeId", getTasksByEmployee);

// Admin tasks
router.post("/create", createTask); // match frontend
router.get("/", getTasks);
// taskRoutes.js
router.get("/my-tasks/:employeeId", getTasksByEmployee);


module.exports = router;
