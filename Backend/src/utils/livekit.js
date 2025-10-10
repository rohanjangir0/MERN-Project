// utils/livekit.js
const { AccessToken, VideoGrant } = require('livekit-server-sdk');
const dotenv = require("dotenv");
dotenv.config();

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL; // e.g., "ws://localhost:7880"

function generateToken(roomName, identity, name, permissions = { canPublish: true }) {
  const at = new AccessToken(API_KEY, API_SECRET, { identity, name });
  const grant = new VideoGrant({
    room: roomName,
    canPublish: permissions.canPublish,
  });
  at.addGrant(grant);
  return at.toJwt();
}

module.exports = { generateToken, LIVEKIT_URL };
