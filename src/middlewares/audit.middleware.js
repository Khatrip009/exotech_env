// src/middlewares/audit.middleware.js
import { auditAsync } from "./audit.helper.js";

/**
 * Audit protected actions
 * Usage: auditAction("VIEW_PROFILE")
 */
export function auditAction(action, entityType = null) {
  return (req, res, next) => {
    res.on("finish", () => {
      if (!req.user) return;

      auditAsync({
        actorId: req.user.id,
        actorRole: req.user.role,
        action,
        entityType,
        entityId: req.params.id || null,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
    });

    next();
  };
}
