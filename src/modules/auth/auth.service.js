import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { findUserByEmail, createSession } from "./auth.repository.js";
import { auditAsync } from "../../middlewares/audit.helper.js";

export async function login(payload, meta) {
  const user = await findUserByEmail(payload.email);

  if (!user) {
    auditAsync({
      action: "LOGIN_FAILED",
      ipAddress: meta.ip,
      userAgent: meta.browser
    });

    throw { status: 401, message: "Invalid credentials" };
  }

  const match = await bcrypt.compare(payload.password, user.password_hash);

  if (!match) {
    auditAsync({
      actorId: user.id,
      actorRole: user.role,
      action: "LOGIN_FAILED",
      ipAddress: meta.ip,
      userAgent: meta.browser
    });

    throw { status: 401, message: "Invalid credentials" };
  }

  const session = await createSession({
    userId: user.id,
    deviceType: meta.device,
    browser: meta.browser,
    ip: meta.ip
  });

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "LOGIN_SUCCESS",
    entityType: "SESSION",
    entityId: session.id,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });

  const accessToken = jwt.sign(
    { id: user.id, role: user.role, sessionId: session.id },
    env.jwtSecret,
    { expiresIn: env.jwtAccessExpiry }
  );

 const refreshToken = jwt.sign(
  {
    id: user.id,
    role: user.role,
    sessionId: session.id
  },
  env.jwtSecret,
  { expiresIn: env.jwtRefreshExpiry }
);


  return { accessToken, refreshToken };
}
