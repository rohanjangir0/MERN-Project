const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto')
const nodemailer = require('nodemailer')

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

//forgot krna h password ko

// forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(404).json({ error: "No employee with this email" });

    // create reset token
    const token = crypto.randomBytes(32).toString("hex");
    employee.resetToken = token;
    employee.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await employee.save();

    // Gmail SMTP setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Use FRONTEND_URL from .env
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: employee.email,
      subject: "Password Reset Request",
      html: `<p>Hello ${employee.name},</p>
             <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
             <p>This link is valid for 1 hour.</p>`,
    });

    res.json({ message: "Reset Link Sent To Your Email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Reset Password
// ========================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const employee = await Employee.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // check expiry
    });

    if (!employee) return res.status(400).json({ error: "Invalid or expired token" });

    // hash new password
    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(newPassword, salt);

    // clear token
    employee.resetToken = undefined;
    employee.resetTokenExpiry = undefined;

    await employee.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
