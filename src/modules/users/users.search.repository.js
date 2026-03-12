import { pool } from "../../db/pool.js";

export async function searchUsers(query, viewerId, limit = 20) {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      up.full_name,
      up.profile_photo,
      fs.followers_count
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN user_follow_stats fs ON fs.user_id = u.id

    WHERE
      up.full_name ILIKE $1
      AND u.id <> $2

      AND NOT EXISTS (
        SELECT 1 FROM user_blocks b
        WHERE (b.blocker_id = $2 AND b.blocked_id = u.id)
           OR (b.blocker_id = u.id AND b.blocked_id = $2)
      )

    ORDER BY fs.followers_count DESC NULLS LAST
    LIMIT $3
    `,
    [`%${query}%`, viewerId, limit]
  );

  return rows;
}
