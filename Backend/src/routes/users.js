// src/routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Employee = require("../models/Employee");

// GET all users (Admins, SuperAdmins, Clients) + Employees
router.get("/", async (req, res) => {
  try {
    // Users already have roles (Admin, SuperAdmin, Client, Employee)
    const users = await User.find({}, "name email role department");

    // Employees (for your Employee schema without role)
    const employees = await Employee.find({}, "name email department");

    const employeeUsers = employees.map(emp => ({
      _id: emp._id,
      name: emp.name,
      email: emp.email,
      role: "Employee",
      department: emp.department,
    }));

    // Merge both lists
    const allUsers = [...users, ...employeeUsers];

    res.json(allUsers);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
