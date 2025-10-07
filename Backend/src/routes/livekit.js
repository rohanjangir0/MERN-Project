const express = require("express");
const router = express.Router();
const { AccessToken } = require("livekit-server-sdk");

router.get("/token", async (req, res) => {
  const { room, identity, name } = req.query;

  if (!room || !identity) {
    return res.status(400).json({ message: "Missing room or identity" });
  }

  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL || "wss://saas-platform-e58rls1t.livekit.cloud";

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name,
      ttl: 60 * 60, // ✅ token valid for 1 hour
    });

    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    res.json({ token, url: livekitUrl });
  } catch (err) {
    console.error("LiveKit token error:", err);
    res.status(500).json({ message: "Token generation failed" });
  }
});

module.exports = router;
