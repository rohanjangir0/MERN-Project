const express = require("express");
const {
  getClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  loginClient
} = require("../controllers/clientController");

const protect = require("../middleware/auth"); // your auth middleware

const router = express.Router();

// CRUD routes (protected)
router.get("/", protect, getClients);
router.get("/:id", protect, getClientById);
router.post("/", protect, addClient);
router.put("/:id", protect, updateClient);
router.delete("/:id", protect, deleteClient);

// 🔹 LOGIN route (public)
router.post("/login", loginClient);

module.exports = router;
