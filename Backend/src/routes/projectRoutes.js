// routes/projectRoutes.js
const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.post("/", projectController.createProject);   // Client submit proposal
router.get("/", projectController.getAllProjects);   // Admin fetch all
router.put("/:id", projectController.updateProject); // Admin update (negotiate, mark deal done)

module.exports = router;
