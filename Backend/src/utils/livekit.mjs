import 'dotenv/config';
import { AccessToken } from 'livekit-server-sdk';

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export async function generateToken(roomName, identity, name, permissions = { canPublish: true, audio: true, video: true }) {
  const at = new AccessToken(API_KEY, API_SECRET, { identity, name });

  const grant = {
  roomJoin: true,
  room: roomName,
  canPublish: permissions.canPublish,
  canSubscribe: true,
  canPublishData: true,
};


  at.addGrant(grant);

  return at.toJwt();
}

export { LIVEKIT_URL };
