const express = require("express");
const router = express.Router();
const MonitoringRequest = require("../models/MonitoringRequest");

// Get pending requests for admin
router.get("/admin/:adminId", async (req, res) => {
  try {
    const requests = await MonitoringRequest.find({ adminId: req.params.adminId, status: "pending" });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get pending requests for employee
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const requests = await MonitoringRequest.find({ employeeId: req.params.employeeId, status: "pending" });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
