const express = require("express");
const router = express.Router();
const {
  addEmployee,
  getEmployees,
  loginEmployee,
  updateEmployee,
  deleteEmployee,
  forgotPassword,   
  resetPassword    
} = require("../controllers/employeeController");


router.post("/add", addEmployee);
router.get("/", getEmployees);
router.post("/login", loginEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);


router.post("/forgot-password", forgotPassword);       // ✅ request reset link
router.post("/reset-password/:token", resetPassword);  // ✅ set new password

module.exports = router;
