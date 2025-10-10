const express = require("express");
const router = express.Router();
const MonitoringRequest = require("../models/MonitoringRequest");

// Admin view
router.get("/admin/:adminId", async (req, res) => {
  const requests = await MonitoringRequest.find({ adminId: req.params.adminId });
  res.json(requests);
});

// Employee view
router.get("/employee/:employeeId", async (req, res) => {
  const requests = await MonitoringRequest.find({ employeeId: req.params.employeeId });
  res.json(requests);
});

module.exports = router;
