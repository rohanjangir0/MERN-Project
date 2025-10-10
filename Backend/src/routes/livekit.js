const express = require("express");
const router = express.Router();
const { AccessToken, VideoGrant } = require("livekit-server-sdk"); // ✅ v2 CommonJS import
require("dotenv").config();

router.get("/token", (req, res) => {
  try {
    const { room, identity, name, role } = req.query;
    if (!room || !identity || !role) {
      return res.status(400).json({ message: "Missing parameters: room, identity, role" });
    }

    const canPublish = role !== "admin";

    // Create token
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity, name }
    );

    // ⚡ Important: Use VideoGrant directly
    const grant = VideoGrant({ room, canPublish, audio: canPublish, video: canPublish });
    token.addGrant(grant);

    res.json({
      token: token.toJwt(),
      url: process.env.LIVEKIT_URL,
    });
  } catch (err) {
    console.error("LiveKit token error:", err);
    res.status(500).json({ message: "Failed to generate LiveKit token", error: err.message });
  }
});

module.exports = router;
