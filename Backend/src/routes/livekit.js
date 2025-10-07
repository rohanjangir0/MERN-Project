const express = require("express");
const router = express.Router();
const { AccessToken } = require("livekit-server-sdk");

router.get("/token", async (req, res) => {
  const { room, identity, name } = req.query;

  if (!room || !identity) {
    return res.status(400).json({ message: "Missing room or identity" });
  }

  try {
    // Replace with your actual LiveKit API credentials
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = "wss://saas-platform-e58rls1t.livekit.cloud";

    // ✅ Create a *signed JWT token string*, not an object
    const at = new AccessToken(apiKey, apiSecret, { identity, name });
    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

    const token = await at.toJwt(); // <--- ✅ this returns a STRING JWT

    res.json({ token, url: livekitUrl }); // ✅ token is now a string
  } catch (err) {
    console.error("LiveKit token error:", err);
    res.status(500).json({ message: "Token generation failed" });
  }
});

module.exports = router;
