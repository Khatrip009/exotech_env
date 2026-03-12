import { pool } from "../../db/pool.js";

export async function getSessionById(sessionId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, revoked_at
     FROM user_sessions
     WHERE id = $1`,
    [sessionId]
  );
  return rows[0];
}

export async function revokeSession(sessionId) {
  await pool.query(
    `UPDATE user_sessions
     SET revoked_at = now()
     WHERE id = $1`,
    [sessionId]
  );
}

export async function revokeAllUserSessions(userId) {
  await pool.query(
    `UPDATE user_sessions
     SET revoked_at = now()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}
