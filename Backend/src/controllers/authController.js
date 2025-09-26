const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register new employee (Admin only)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Prevent creating Admin via this route
    if (role === "Admin") {
      return res.status(403).json({ error: "Cannot create Admin via this route" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const user = new User({ name, email, password, role, department });
    await user.save();

    res.status(201).json({
      message: "Employee created",
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Login (Admin & Employee)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Find user by email only
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    // 🔹 Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    // 🔹 Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔹 Send response
    res.json({
      token,
      role: user.role,
      name: user.name,
      department: user.department
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
