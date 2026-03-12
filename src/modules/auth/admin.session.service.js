import { revokeAllUserSessions } from "./session.repository.js";
import { auditAsync } from "../../middlewares/audit.helper.js";

export async function adminRevokeUserSessions(admin, targetUserId, meta) {
  await revokeAllUserSessions(targetUserId);

  auditAsync({
    actorId: admin.id,
    actorRole: admin.role,
    action: "ADMIN_REVOKE_SESSIONS",
    entityType: "USER",
    entityId: targetUserId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}
    