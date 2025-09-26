const express = require("express");
const router = express.Router();
const { getMessages } = require("../controllers/messageController");

// GET /api/messages?senderId=xxx&receiverId=yyy
router.get("/", getMessages);

module.exports = router;
