const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");

// GET all announcements
router.get("/", announcementController.getAllAnnouncements);

// POST new announcement
router.post("/", announcementController.createAnnouncement);

module.exports = router;
