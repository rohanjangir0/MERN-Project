// src/routes/livekit.js
const express = require("express");
const { AccessToken } = require("livekit-server-sdk");
const router = express.Router();

const LIVEKIT_URL = process.env.LIVEKIT_URL;          // wss://saas-platform-e58rls1t.livekit.cloud
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;  // APIASfLDfbsqxec
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET; // vACzDx4DJTfOLOMgPs51gFFdBByrMueck5edpH8DpYnB

router.get("/token", (req, res) => {
  const { identity, name, room } = req.query;
  if (!identity || !room) return res.status(400).json({ error: "Missing identity or room" });

  try {
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity, name });
    at.addGrant({ roomJoin: true, room });

    const token = at.toJwt();
    res.json({ token, url: LIVEKIT_URL });
  } catch (err) {
    console.error("❌ LiveKit token error:", err);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

module.exports = router;
