const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const auth = require("../middleware/auth"); // your auth.js

// Clock in/out
router.post("/clock", auth, attendanceController.clock);

// Auto logout (optional)
router.post("/auto-logout", auth, attendanceController.autoLogout);

// Attendance history
router.get("/", auth, attendanceController.getHistory);       // current user's history
router.get("/:userId", auth, attendanceController.getHistory); // admin can get specific user

module.exports = router;
