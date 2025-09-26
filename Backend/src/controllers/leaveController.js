const Leave = require('../models/LeaveRequest');

// Employee: Create leave
exports.createLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason, leaveType } = req.body;
    if (!startDate || !endDate || !reason) 
        return res.status(400).json({ error: "All fields are required" });

    const duration = Math.floor((new Date(endDate) - new Date(startDate)) / (1000*60*60*24)) + 1;

    const leave = await Leave.create({
      employeeId: req.user.id,
      name: req.user.name,
      department: req.user.department,
      leaveType,
      startDate,
      endDate,
      duration,
      reason,
      status: 'Pending'
    });

    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Employee: Get own leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Get all leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Update leave status
exports.updateStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, adminRemark },
      { new: true }
    );
    if (!leave) return res.status(404).json({ error: 'Leave not found' });
    res.json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Employee: Delete pending leave
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findOneAndDelete({
      _id: req.params.id,
      employeeId: req.user.id,
      status: 'Pending'
    });
    if (!leave) return res.status(404).json({ error: 'Leave not found or cannot delete' });
    res.json({ message: 'Leave deleted successfully', leaveId: leave._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
