// src/modules/posts/posts.repository.js
import { pool } from "../../db/pool.js";
import { decodeCursor } from "../../utils/cursor.js";

/* =========================
   POSTS
========================= */

export async function insertPost({
  authorId,
  content,
  postType,
  isPinned,
  visibility,
}) {
  const { rows } = await pool.query(
    `
    INSERT INTO posts (author_id, content, post_type, is_pinned, visibility)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [
      authorId,
      content,
      postType,
      isPinned ?? false,
      visibility ?? "PUBLIC",
    ]
  );
  return rows[0];
}

/* =========================
   FEEDS
========================= */

export async function fetchFeed(limit = 20, offset = 0) {
  const { rows } = await pool.query(
    `
    SELECT
      p.*,
      up.full_name,
      up.profile_photo
    FROM posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE p.status = 'PUBLISHED'
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );
  return rows;
}

export async function fetchUserPosts(viewerId, profileUserId) {
  const { rows } = await pool.query(
    `
    SELECT
      p.*,
      up.full_name,
      up.profile_photo
    FROM posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE p.author_id = $2
      AND p.status = 'PUBLISHED'
      AND (
        p.visibility = 'PUBLIC'
        OR p.author_id = $1
        OR (
          p.visibility = 'FOLLOWERS'
          AND EXISTS (
            SELECT 1
            FROM user_followers
            WHERE follower_id = $1
              AND followed_id = p.author_id
          )
        )
      )
    ORDER BY p.created_at DESC
    `,
    [viewerId, profileUserId]
  );
  return rows;
}

export async function fetchPostById(postId) {
  const { rows } = await pool.query(
    `
    SELECT
      p.*,
      up.full_name,
      up.profile_photo
    FROM posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE p.id = $1
      AND p.status = 'PUBLISHED'
    `,
    [postId]
  );

  return rows[0] || null;
}

/* =========================
   DELETE
========================= */

export async function deletePost(postId, userId) {
  const r = await pool.query(
    `
    DELETE FROM posts
    WHERE id = $1 AND author_id = $2
    `,
    [postId, userId]
  );
  return r.rowCount > 0;
}

/* =========================
   LIKES
========================= */

export async function likePost(postId, userId) {
  await pool.query(
    `
    INSERT INTO post_likes (post_id, user_id)
    VALUES ($1,$2)
    ON CONFLICT DO NOTHING
    `,
    [postId, userId]
  );
}

export async function unlikePost(postId, userId) {
  await pool.query(
    `
    DELETE FROM post_likes
    WHERE post_id = $1 AND user_id = $2
    `,
    [postId, userId]
  );
}

/* =========================
   COMMENTS
========================= */

export async function addComment(postId, userId, comment) {
  const { rows } = await pool.query(
    `
    INSERT INTO post_comments (post_id, user_id, comment)
    VALUES ($1,$2,$3)
    RETURNING *
    `,
    [postId, userId, comment]
  );
  return rows[0];
}

export async function deleteComment(commentId, userId) {
  const r = await pool.query(
    `
    DELETE FROM post_comments
    WHERE id = $1 AND user_id = $2
    `,
    [commentId, userId]
  );
  return r.rowCount > 0;
}

/* =========================
   VIEWS
========================= */

export async function recordView({
  postId,
  viewerId,
  isFollower,
  deviceType,
  ipAddress,
}) {
  await pool.query(
    `
    INSERT INTO post_views (
      post_id,
      viewer_id,
      is_follower,
      device_type,
      ip_address
    ) VALUES ($1,$2,$3,$4,$5)
    `,
    [postId, viewerId, isFollower, deviceType, ipAddress]
  );
}

/* =========================
   FOLLOWER FEED
========================= */

export async function fetchFollowerFeed(userId, limit, offset) {
  const { rows } = await pool.query(
    `
    SELECT
  p.*,
  up.full_name,
  up.profile_photo,
  COUNT(pl.user_id) AS like_count
FROM posts p
JOIN users u ON u.id = p.author_id
LEFT JOIN user_profiles up ON up.user_id = u.id
LEFT JOIN post_likes pl ON pl.post_id = p.id
WHERE p.status = 'PUBLISHED'
  AND (
    p.visibility = 'PUBLIC'
    OR (
      p.visibility = 'FOLLOWERS'
      AND (
        p.author_id = $1
        OR EXISTS (
          SELECT 1
          FROM user_follows f
          WHERE f.follower_id = $1
            AND f.following_id = p.author_id
            AND f.is_active = true
        )
      )
    )
  )
GROUP BY p.id, up.full_name, up.profile_photo
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3

    `,
    [userId, limit, offset]
  );
  return rows;
}

/* =========================
   MEDIA
========================= */

export async function attachMedia(postId, files) {
  if (!files?.length) return;

  const values = files.map((f, i) => [
    postId,
    `/uploads/posts/${f.filename}`,
    f.mimetype,
    i + 1,
  ]);

  const placeholders = values
    .map(
      (_, i) =>
        `($${i * 4 + 1},$${i * 4 + 2},$${i * 4 + 3},$${i * 4 + 4})`
    )
    .join(",");

  await pool.query(
    `
    INSERT INTO post_media (post_id, media_url, media_type, sort_order)
    VALUES ${placeholders}
    `,
    values.flat()
  );
}

export async function fetchPostMedia(postId) {
  const { rows } = await pool.query(
    `
    SELECT media_url
    FROM post_media
    WHERE post_id = $1
    `,
    [postId]
  );
  return rows;
}

/* =========================
   RANKED FEEDS
========================= */

export async function fetchRankedFeed(userId, limit, offset) {
  const { rows } = await pool.query(
    `
    SELECT
      p.*,
      up.full_name,
      up.profile_photo,
      COUNT(pl.user_id) AS like_count,
      (
        COUNT(pl.user_id) * 2 +
        (1 / GREATEST(EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600, 1))
      ) AS score
    FROM posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN post_likes pl ON pl.post_id = p.id
    WHERE p.status = 'PUBLISHED'
      AND (
        p.visibility = 'PUBLIC'
        OR (
          p.visibility = 'FOLLOWERS'
          AND (
            p.author_id = $1
            OR EXISTS (
              SELECT 1
              FROM user_followers
              WHERE follower_id = $1
                AND followed_id = p.author_id
            )
          )
        )
      )
    GROUP BY p.id, up.full_name, up.profile_photo
    ORDER BY score DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );
  return rows;
}

export async function fetchRankedFeedCursor({
  userId,
  limit,
  cursor,
}) {
  const decoded = decodeCursor(cursor);

  const values = [userId, limit];
  let cursorCondition = "";

  if (decoded) {
    values.push(decoded.created_at, decoded.id);
    cursorCondition = `
      AND (
        p.created_at < $3
        OR (p.created_at = $3 AND p.id < $4)
      )
    `;
  }

  const { rows } = await pool.query(
    `
    SELECT
      p.*,
      up.full_name,
      up.profile_photo,
      COUNT(pl.user_id) AS like_count,
      (
        COUNT(pl.user_id) * 2 +
        (1 / GREATEST(EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600, 1))
      ) AS score
    FROM posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN post_likes pl ON pl.post_id = p.id
    WHERE p.status = 'PUBLISHED'
      AND (
        p.visibility = 'PUBLIC'
        OR (
          p.visibility = 'FOLLOWERS'
          AND (
            p.author_id = $1
            OR EXISTS (
              SELECT 1
              FROM user_followers
              WHERE follower_id = $1
                AND followed_id = p.author_id
            )
          )
        )
      )
      ${cursorCondition}
    GROUP BY p.id, up.full_name, up.profile_photo
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT $2
    `,
    values
  );

  return rows;
}

/* =========================
   REACTIONS
========================= */

export async function upsertReaction(postId, userId, emoji) {
  await pool.query(
    `
    INSERT INTO post_reactions (post_id, user_id, emoji)
    VALUES ($1,$2,$3)
    ON CONFLICT (post_id, user_id)
    DO UPDATE SET emoji = EXCLUDED.emoji
    `,
    [postId, userId, emoji]
  );
}

export async function removeReaction(postId, userId) {
  await pool.query(
    `
    DELETE FROM post_reactions
    WHERE post_id = $1 AND user_id = $2
    `,
    [postId, userId]
  );
}

/* =========================
   REACTION AGGREGATION
========================= */

export async function fetchReactionsForPosts(postIds, viewerId) {
  if (!postIds.length) return {};

  const { rows } = await pool.query(
    `
    SELECT
      pr.post_id,
      pr.emoji,
      COUNT(*) AS count,
      BOOL_OR(pr.user_id = $2) AS is_mine
    FROM post_reactions pr
    WHERE pr.post_id = ANY($1)
    GROUP BY pr.post_id, pr.emoji
    `,
    [postIds, viewerId]
  );

  const map = {};

  for (const r of rows) {
    if (!map[r.post_id]) {
      map[r.post_id] = {
        reactions: {},
        my_reaction: null,
      };
    }

    map[r.post_id].reactions[r.emoji] = Number(r.count);

    if (r.is_mine) {
      map[r.post_id].my_reaction = r.emoji;
    }
  }

  return map;
}

/* =========================
   UPDATE / PIN
========================= */

export async function updatePostContent(
  postId,
  userId,
  content,
  isAdmin = false
) {
  const { rowCount } = await pool.query(
    `
    UPDATE posts
    SET content = $1,
        edited_at = now()
    WHERE id = $2
      AND (author_id = $3 OR $4 = true)
      AND (is_pinned = false OR $4 = true)
    `,
    [content, postId, userId, isAdmin]
  );

  return rowCount > 0;
}

export async function setPostPinned(
  postId,
  userId,
  isAdmin,
  pinned
) {
  const { rowCount } = await pool.query(
    `
    UPDATE posts
    SET is_pinned = $1
    WHERE id = $2
      AND (author_id = $3 OR $4 = true)
    `,
    [pinned, postId, userId, isAdmin]
  );

  return rowCount > 0;
}

// ADD THIS to posts.repository.js
export async function getPostAuthor(postId) {
  const { rows } = await pool.query(
    `
    SELECT id, author_id
    FROM posts
    WHERE id = $1
      AND status = 'PUBLISHED'
    `,
    [postId]
  );

  return rows[0] || null;
}

