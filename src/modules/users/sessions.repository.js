import { pool } from "../../db/pool.js";

/* =====================================================
   CREATE SESSION
   (Call on successful login)
===================================================== */
export async function createSession({
  userId,
  deviceType,
  browser,
  ipAddress
}) {
  const { rows } = await pool.query(
    `
    INSERT INTO user_sessions (
      user_id,
      device_type,
      browser,
      ip_address
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `,
    [userId, deviceType, browser, ipAddress]
  );

  return rows[0];
}

/* =====================================================
   LIST USER SESSIONS
===================================================== */
export async function listUserSessions(userId) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      device_type,
      browser,
      ip_address,
      last_active,
      revoked_at,
      created_at
    FROM user_sessions
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return rows;
}

/* =====================================================
   TOUCH SESSION (UPDATE LAST ACTIVE)
===================================================== */
export async function touchSession(sessionId) {
  await pool.query(
    `
    UPDATE user_sessions
    SET last_active = now()
    WHERE id = $1 AND revoked_at IS NULL
    `,
    [sessionId]
  );
}

/* =====================================================
   REVOKE SESSION
===================================================== */
export async function revokeSession(userId, sessionId) {
  const { rowCount } = await pool.query(
    `
    UPDATE user_sessions
    SET revoked_at = now()
    WHERE id = $1
      AND user_id = $2
      AND revoked_at IS NULL
    `,
    [sessionId, userId]
  );

  return rowCount > 0;
}

/* =====================================================
   REVOKE ALL OTHER SESSIONS
===================================================== */
export async function revokeOtherSessions(userId, keepSessionId) {
  await pool.query(
    `
    UPDATE user_sessions
    SET revoked_at = now()
    WHERE user_id = $1
      AND id <> $2
      AND revoked_at IS NULL
    `,
    [userId, keepSessionId]
  );
}

/* =====================================================
   VALIDATE SESSION (JWT GUARD)
===================================================== */
export async function isSessionValid(sessionId) {
  const { rowCount } = await pool.query(
    `
    SELECT 1
    FROM user_sessions
    WHERE id = $1 AND revoked_at IS NULL
    `,
    [sessionId]
  );

  return rowCount > 0;
}
