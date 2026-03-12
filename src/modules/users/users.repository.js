// src/modules/users/users.repository.js
import { pool } from "../../db/pool.js";

/**
 * Fetch authenticated user's core profile
 * Includes follow stats (followers / following counts)
 */
export async function getUserMe(userId) {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      u.email,
      u.role,
      u.status,
      u.is_verified,
      u.created_at,

      up.full_name,
      up.profile_photo,
      up.city,
      up.state,
      up.country,
      up.bio,

      ps.profile_visibility,
      ps.messaging_allowed,

      COALESCE(fs.followers_count, 0) AS followers_count,
      COALESCE(fs.following_count, 0) AS following_count,

      ARRAY_AGG(
        jsonb_build_object(
          'designation_id', ud.designation_id,
          'is_primary', ud.is_primary
        )
      ) FILTER (WHERE ud.designation_id IS NOT NULL) AS designations

    FROM users u
    LEFT JOIN user_profiles up 
      ON up.user_id = u.id

    LEFT JOIN privacy_settings ps 
      ON ps.user_id = u.id

    LEFT JOIN user_follow_stats fs 
      ON fs.user_id = u.id

    LEFT JOIN user_designations ud 
      ON ud.user_id = u.id

    WHERE u.id = $1

    GROUP BY
      u.id,
      up.user_id,
      ps.user_id,
      fs.user_id
    `,
    [userId]
  );

  return rows[0];
}

/* =====================================================
   UPSERT USER PROFILE
===================================================== */
export async function upsertUserProfile(userId, data) {
  const fields = Object.keys(data);
  if (!fields.length) return;

  const updates = fields
    .map((k, i) => `${k} = $${i + 2}`)
    .join(", ");

  await pool.query(
    `
    INSERT INTO user_profiles (user_id, ${fields.join(", ")})
    VALUES ($1, ${fields.map((_, i) => `$${i + 2}`).join(", ")})
    ON CONFLICT (user_id)
    DO UPDATE SET
      ${updates},
      updated_at = now()
    `,
    [userId, ...Object.values(data)]
  );
}

/* =====================================================
   UPSERT PRIVACY SETTINGS
===================================================== */
export async function upsertPrivacySettings(userId, data) {
  const fields = Object.keys(data);
  if (!fields.length) return;

  const updates = fields
    .map((k, i) => `${k} = $${i + 2}`)
    .join(", ");

  await pool.query(
    `
    INSERT INTO privacy_settings (user_id, ${fields.join(", ")})
    VALUES ($1, ${fields.map((_, i) => `$${i + 2}`).join(", ")})
    ON CONFLICT (user_id)
    DO UPDATE SET
      ${updates},
      updated_at = now()
    `,
    [userId, ...Object.values(data)]
  );
}

export async function getPublicUserProfile(targetUserId) {
  const { rows } = await pool.query(
    `
    SELECT
      u.id,
      u.role,
      u.is_verified,
      u.created_at,

      up.full_name,
      up.profile_photo,
      up.city,
      up.state,
      up.country,
      up.bio,

      ps.profile_visibility,

      COALESCE(fs.followers_count, 0) AS followers_count,
      COALESCE(fs.following_count, 0) AS following_count

    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN privacy_settings ps ON ps.user_id = u.id
    LEFT JOIN user_follow_stats fs ON fs.user_id = u.id

    WHERE u.id = $1
    `,
    [targetUserId]
  );

  return rows[0];
}
