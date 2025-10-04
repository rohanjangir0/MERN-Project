const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      employeeId: payload.employeeId, // make sure JWT contains this
      role: payload.role,
      name: payload.name,
    };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
