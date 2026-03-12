import { pool } from "../../db/pool.js";

/* =====================================================
   CHECK IF viewer FOLLOWS target
===================================================== */
export async function isFollowing(viewerId, targetUserId) {
  const { rowCount } = await pool.query(
    `
    SELECT 1
    FROM user_follows
    WHERE follower_id = $1
      AND following_id = $2
      AND is_active = true
    `,
    [viewerId, targetUserId]
  );

  return rowCount > 0;
}

/* =====================================================
   CHECK IF BLOCK EXISTS (EITHER DIRECTION)
===================================================== */
export async function isBlockedBetween(userA, userB) {
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
   CHECK IF viewer MUTED target
===================================================== */
export async function isMuted(viewerId, targetUserId) {
  const { rowCount } = await pool.query(
    `
    SELECT 1
    FROM user_mutes
    WHERE muter_id = $1 AND muted_id = $2
    `,
    [viewerId, targetUserId]
  );

  return rowCount > 0;
}