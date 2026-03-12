import { revokeSession } from "./session.repository.js";
import { auditAsync } from "../../middlewares/audit.helper.js";

export async function logoutCurrentSession(user, meta) {
  await revokeSession(user.sessionId);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "LOGOUT",
    entityType: "SESSION",
    entityId: user.sessionId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}
