const express = require('express');
const router = express.Router();

router.get('/token', async (req, res) => {
  try {
    const { room, identity, name, role } = req.query;
    if (!room || !identity || !role) {
      return res.status(400).json({ message: "Missing parameters: room, identity, role" });
    }

    const canPublish = role !== 'admin';

    // Dynamically import ESM utility
    const { generateToken, LIVEKIT_URL } = await import('../utils/livekit.mjs');

    const token = await generateToken(room, identity, name, {
      canPublish,
      audio: canPublish,
      video: canPublish
    });

    res.json({ token, url: LIVEKIT_URL });

  } catch (err) {
    console.error("LiveKit token error:", err);
    res.status(500).json({ message: "Failed to generate LiveKit token", error: err.message });
  }
});

module.exports = router;
