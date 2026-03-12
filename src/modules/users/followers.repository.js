import { pool } from "../../db/pool.js";

/* =====================================================
   FOLLOW USER (IDEMPOTENT)
===================================================== */
export async function followUser(followerId, followingId) {
  await pool.query(
    `
    INSERT INTO user_follows (follower_id, following_id, is_active)
    VALUES ($1, $2, true)
    ON CONFLICT (follower_id, following_id)
    DO UPDATE SET is_active = true, created_at = now()
    `,
    [followerId, followingId]
  );

  await recalcFollowStats(followerId, followingId);
}

/* =====================================================
   UNFOLLOW USER
===================================================== */
export async function unfollowUser(followerId, followingId) {
  await pool.query(
    `
    UPDATE user_follows
    SET is_active = false
    WHERE follower_id = $1 AND following_id = $2
    `,
    [followerId, followingId]
  );

  await recalcFollowStats(followerId, followingId);
}

/* =====================================================
   LIST FOLLOWERS
===================================================== */
export async function listFollowers(userId, limit = 20, offset = 0) {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      up.full_name,
      up.profile_photo
    FROM user_follows f
    JOIN users u ON u.id = f.follower_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE f.following_id = $1
      AND f.is_active = true
    ORDER BY f.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );

  return rows;
}

/* =====================================================
   LIST FOLLOWING
===================================================== */
export async function listFollowing(userId, limit = 20, offset = 0) {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      up.full_name,
      up.profile_photo
    FROM user_follows f
    JOIN users u ON u.id = f.following_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE f.follower_id = $1
      AND f.is_active = true
    ORDER BY f.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );

  return rows;
}

/* =====================================================
   FOLLOW STATS RECALC (SAFE)
===================================================== */
async function recalcFollowStats(followerId, followingId) {
  await pool.query(
    `
    INSERT INTO user_follow_stats (user_id, followers_count, following_count)
    VALUES ($1, 0, 0)
    ON CONFLICT (user_id) DO NOTHING
    `,
    [followerId]
  );

  await pool.query(
    `
    INSERT INTO user_follow_stats (user_id, followers_count, following_count)
    VALUES ($1, 0, 0)
    ON CONFLICT (user_id) DO NOTHING
    `,
    [followingId]
  );

  await pool.query(
    `
    UPDATE user_follow_stats
    SET following_count = (
      SELECT COUNT(*) FROM user_follows
      WHERE follower_id = $1 AND is_active = true
    ),
    last_updated = now()
    WHERE user_id = $1
    `,
    [followerId]
  );

  await pool.query(
    `
    UPDATE user_follow_stats
    SET followers_count = (
      SELECT COUNT(*) FROM user_follows
      WHERE following_id = $1 AND is_active = true
    ),
    last_updated = now()
    WHERE user_id = $1
    `,
    [followingId]
  );
}
