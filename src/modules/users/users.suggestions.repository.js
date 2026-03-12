import { pool } from "../../db/pool.js";

export async function getFollowSuggestions(userId, limit = 10) {
  const { rows } = await pool.query(
    `
    SELECT DISTINCT
      u.id,
      up.full_name,
      up.profile_photo,
      fs.followers_count
    FROM user_follows f1
    JOIN user_follows f2
      ON f1.following_id = f2.follower_id
    JOIN users u
      ON u.id = f2.following_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN user_follow_stats fs ON fs.user_id = u.id

    WHERE f1.follower_id = $1
      AND f1.is_active = true
      AND f2.is_active = true
      AND u.id <> $1

      AND NOT EXISTS (
        SELECT 1 FROM user_follows f3
        WHERE f3.follower_id = $1
          AND f3.following_id = u.id
          AND f3.is_active = true
      )

      AND NOT EXISTS (
        SELECT 1 FROM user_blocks b
        WHERE (b.blocker_id = $1 AND b.blocked_id = u.id)
           OR (b.blocker_id = u.id AND b.blocked_id = $1)
      )

    ORDER BY fs.followers_count DESC NULLS LAST
    LIMIT $2
    `,
    [userId, limit]
  );

  return rows;
}
