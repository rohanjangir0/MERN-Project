// middleware/isAdmin.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; 
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("isAdmin middleware error:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};
