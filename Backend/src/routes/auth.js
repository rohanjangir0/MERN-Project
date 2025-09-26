const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Admin creates employee accounts
router.post("/register", auth, isAdmin, authCtrl.register);

// Login for both Admin & Employee
router.post("/login", authCtrl.login);

module.exports = router;
