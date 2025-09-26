const express = require("express");
const router = express.Router();
const { addEmployee, getEmployees, loginEmployee, updateEmployee, deleteEmployee } = require("../controllers/employeeController");

router.post("/add", addEmployee);
router.get("/", getEmployees);
router.post("/login", loginEmployee); // make sure loginEmployee exists
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
