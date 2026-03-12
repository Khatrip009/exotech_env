import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { getSessionById } from "./session.repository.js";
import { auditAsync } from "../../middlewares/audit.helper.js";
import { findUserById } from "./auth.repository.js";

export async function refreshAccessToken(refreshToken, meta) {
  let payload;

  try {
    payload = jwt.verify(refreshToken, env.jwtSecret);
  } catch {
    throw { status: 401, message: "Invalid or expired refresh token" };
  }

  const { id: userId, sessionId } = payload;

  const session = await getSessionById(sessionId);
  if (!session || session.revoked_at) {
    throw { status: 401, message: "Session revoked" };
  }

  const user = await findUserById(userId);
  if (!user) {
    throw { status: 401, message: "User not found" };
  }
 const accessToken = jwt.sign(
  {
    id: user.id,
    role: user.role,
    sessionId
  },
  env.jwtSecret,
  { expiresIn: env.jwtAccessExpiry }
);

  auditAsync({
    actorId: userId,
    action: "TOKEN_REFRESH",
    entityType: "SESSION",
    entityId: sessionId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });

  return { accessToken };
}
