const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

// POST /api/projects
router.post("/", projectController.createProject);

// GET /api/projects
router.get("/", projectController.getAllProjects);

module.exports = router;
