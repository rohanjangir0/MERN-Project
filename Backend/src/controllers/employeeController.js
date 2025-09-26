const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Add employee
exports.addEmployee = async (req, res) => {
  try {
    const { name, email, phone, department, password } = req.body;
    const employeeId = "EMP" + Date.now(); // generate unique ID

    const employee = new Employee({ employeeId, name, email, phone, department, password });
    await employee.save();
    res.status(201).json({ message: "Employee added", employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Login employee
exports.loginEmployee = async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(400).json({ error: "Invalid ID or password" });

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid ID or password" });

    const token = jwt.sign(
      { id: employee._id, role: "Employee", name: employee.name, employeeId: employee.employeeId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: "Employee", name: employee.name, employeeId: employee.employeeId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
