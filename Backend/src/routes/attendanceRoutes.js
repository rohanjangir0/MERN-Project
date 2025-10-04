const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const auth = require("../middleware/auth");

// Apply auth middleware
router.use(auth);

router.post("/clock", attendanceController.clock);
router.post("/break", attendanceController.break);
router.get("/history", attendanceController.history);

module.exports = router;
