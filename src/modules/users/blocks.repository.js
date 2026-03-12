import { pool } from "../../db/pool.js";

/* =====================================================
   BLOCK USER (IDEMPOTENT)
===================================================== */
export async function blockUser(blockerId, blockedId) {
  await pool.query(
    `
    INSERT INTO user_blocks (blocker_id, blocked_id)
    VALUES ($1, $2)
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING
    `,
    [blockerId, blockedId]
  );

  /* OPTIONAL BUT RECOMMENDED:
     Auto-remove follow relationships in both directions
  */
  await pool.query(
    `
    UPDATE user_follows
    SET is_active = false
    WHERE
      (follower_id = $1 AND following_id = $2)
      OR
      (follower_id = $2 AND following_id = $1)
    `,
    [blockerId, blockedId]
  );
}

/* =====================================================
   UNBLOCK USER
===================================================== */
export async function unblockUser(blockerId, blockedId) {
  await pool.query(
    `
    DELETE FROM user_blocks
    WHERE blocker_id = $1 AND blocked_id = $2
    `,
    [blockerId, blockedId]
  );
}

/* =====================================================
   CHECK BLOCK RELATIONSHIP
===================================================== */
export async function isBlocked(userA, userB) {
  const { rowCount } = await pool.query(
    `
    SELECT 1
    FROM user_blocks
    WHERE
      (blocker_id = $1 AND blocked_id = $2)
      OR
      (blocker_id = $2 AND blocked_id = $1)
    `,
    [userA, userB]
  );

  return rowCount > 0;
}

/* =====================================================
   LIST BLOCKED USERS
===================================================== */
export async function listBlockedUsers(userId, limit = 20, offset = 0) {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      up.full_name,
      up.profile_photo,
      b.created_at AS blocked_at
    FROM user_blocks b
    JOIN users u ON u.id = b.blocked_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE b.blocker_id = $1
    ORDER BY b.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );

  return rows;
}
