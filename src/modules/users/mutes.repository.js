import { pool } from "../../db/pool.js";

/* =====================================================
   MUTE USER (IDEMPOTENT)
===================================================== */
export async function muteUser(muterId, mutedId) {
  await pool.query(
    `
    INSERT INTO user_mutes (muter_id, muted_id)
    VALUES ($1, $2)
    ON CONFLICT (muter_id, muted_id) DO NOTHING
    `,
    [muterId, mutedId]
  );
}

/* =====================================================
   UNMUTE USER
===================================================== */
export async function unmuteUser(muterId, mutedId) {
  await pool.query(
    `
    DELETE FROM user_mutes
    WHERE muter_id = $1 AND muted_id = $2
    `,
    [muterId, mutedId]
  );
}

/* =====================================================
   CHECK MUTE
===================================================== */
export async function isMuted(muterId, mutedId) {
  const { rowCount } = await pool.query(
    `
    SELECT 1
    FROM user_mutes
    WHERE muter_id = $1 AND muted_id = $2
    `,
    [muterId, mutedId]
  );

  return rowCount > 0;
}

/* =====================================================
   LIST MUTED USERS
===================================================== */
export async function listMutedUsers(userId, limit = 20, offset = 0) {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      up.full_name,
      up.profile_photo,
      m.created_at AS muted_at
    FROM user_mutes m
    JOIN users u ON u.id = m.muted_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE m.muter_id = $1
    ORDER BY m.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );

  return rows;
}
