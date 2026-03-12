// src/middlewares/audit.repository.js
import { pool } from "../db/pool.js";

/**
 * Insert an audit log entry
 */
export async function insertAuditLog({
  actorId = null,
  actorRole = null,
  action,
  entityType = null,
  entityId = null,
  ipAddress = null,
  userAgent = null
}) {
  await pool.query(
    `INSERT INTO audit_logs (
      actor_id,
      actor_role,
      action,
      entity_type,
      entity_id,
      ip_address,
      user_agent
    ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      ipAddress,
      userAgent
    ]
  );
}
