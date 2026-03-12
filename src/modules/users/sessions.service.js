import {
  listUserSessions,
  revokeSession,
  revokeOtherSessions
} from "./sessions.repository.js";

import { auditAsync } from "../../middlewares/audit.helper.js";

export async function getMySessions(user) {
  return listUserSessions(user.id);
}

export async function revokeMySession(user, sessionId, meta) {
  const revoked = await revokeSession(user.id, sessionId);

  if (!revoked) {
    throw {
      status: 404,
      message: "Session not found or already revoked"
    };
  }

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "REVOKE_SESSION",
    entityType: "USER_SESSION",
    entityId: sessionId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}

export async function revokeAllOtherSessions(
  user,
  currentSessionId,
  meta
) {
  await revokeOtherSessions(user.id, currentSessionId);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "REVOKE_OTHER_SESSIONS",
    entityType: "USER",
    entityId: user.id,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}
