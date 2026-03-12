// src/middlewares/audit.helper.js
import { insertAuditLog } from "./audit.repository.js";

/**
 * Fire-and-forget audit logging
 * Never blocks main request
 */
export function auditAsync(payload) {
  insertAuditLog(payload).catch(() => {
    // intentionally swallow audit errors
  });
}
