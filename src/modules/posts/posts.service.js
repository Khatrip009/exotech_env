// src/modules/posts/posts.service.js
import fs from "fs/promises";
import path from "path";

import * as repo from "./posts.repository.js";
import { encodeCursor } from "../../utils/cursor.js";
import { notify } from "../notifications/notifications.service.js";

/* =====================================================
   INTERNAL HELPERS
===================================================== */

async function attachReactions(posts, viewerId) {
  if (!posts.length) return posts;

  const postIds = posts.map(p => p.id);

  const reactionsMap =
    await repo.fetchReactionsForPosts(
      postIds,
      viewerId
    );

  return posts.map(p => ({
    ...p,
    reactions: reactionsMap[p.id]?.reactions || {},
    my_reaction: reactionsMap[p.id]?.my_reaction || null
  }));
}

/* =====================================================
   POSTS
===================================================== */

export async function createPost(user, payload, files = []) {
  const post = await repo.insertPost({
    authorId: user.id,
    content: payload.content,
    postType: payload.post_type || "GENERAL",
    isPinned: payload.is_pinned || false,
    visibility: payload.visibility || "PUBLIC"
  });

  if (files.length) {
    await repo.attachMedia(post.id, files);
  }

  return post;
}

export async function getPostById(postId, viewerId) {
  const post = await repo.fetchPostById(postId, viewerId);
  if (!post) {
    throw { status: 404, message: "Post not found" };
  }

  const enriched = await attachReactions([post], viewerId);
  return enriched[0];
}

/* =====================================================
   FEEDS
===================================================== */

export async function getHomeFeed(userId, limit = 20, offset = 0) {
  const posts =
    await repo.fetchFollowerFeed(
      userId,
      limit,
      offset
    );

  return attachReactions(posts, userId);
}

export async function getFeed(limit = 20, offset = 0, viewerId) {
  const posts = await repo.fetchFeed(limit, offset);
  return attachReactions(posts, viewerId);
}

export async function getUserFeed(viewerId, profileUserId) {
  const posts =
    await repo.fetchUserPosts(
      viewerId,
      profileUserId
    );

  return attachReactions(posts, viewerId);
}

/* =====================================================
   DELETE POST (WITH MEDIA CLEANUP)
===================================================== */

export async function removePost(postId, user) {
  /* ----------------------------------
     1. FETCH MEDIA FIRST
  ---------------------------------- */
  const media = await repo.fetchPostMedia(postId);

  /* ----------------------------------
     2. DELETE POST (DB)
  ---------------------------------- */
  const ok = await repo.deletePost(postId, user.id);

  if (!ok) {
    throw {
      status: 403,
      message: "Not allowed to delete post"
    };
  }

  /* ----------------------------------
     3. DELETE FILES (BEST EFFORT)
  ---------------------------------- */
  for (const m of media) {
    try {
      const filePath = path.resolve(
        process.cwd(),
        m.media_url.replace(/^\//, "")
      );
      await fs.unlink(filePath);
    } catch {
      // intentionally ignored
    }
  }
}

/* =====================================================
   LIKES
===================================================== */

export async function toggleLike(postId, userId, like = true) {
  const post = await repo.getPostAuthor(postId);

  const result = like
    ? await repo.likePost(postId, userId)
    : await repo.unlikePost(postId, userId);

  if (like && post.author_id !== userId) {
    await notify({
      userId: post.author_id,
      title: "New like",
      body: "Someone liked your post"
    });
  }

  return result;
}

/* =====================================================
   COMMENTS
===================================================== */

export async function createComment(postId, userId, comment) {
  const result =
    await repo.addComment(postId, userId, comment);

  const post =
    await repo.getPostAuthor(postId);

  if (post.author_id !== userId) {
    await notify({
      userId: post.author_id,
      title: "New comment",
      body: "Someone commented on your post"
    });
  }

  return result;
}


/* =====================================================
   RANKED FEEDS
===================================================== */

export async function getRankedFeed(
  userId,
  limit = 20,
  offset = 0
) {
  const posts =
    await repo.fetchRankedFeed(
      userId,
      limit,
      offset
    );

  return attachReactions(posts, userId);
}

export async function getRankedFeedCursor(
  userId,
  limit = 20,
  cursor = null
) {
  const posts =
    await repo.fetchRankedFeedCursor({
      userId,
      limit,
      cursor
    });

  const enriched =
    await attachReactions(posts, userId);

  return {
    posts: enriched,
    nextCursor:
      posts.length === limit
        ? encodeCursor({
            created_at: posts.at(-1).created_at,
            id: posts.at(-1).id
          })
        : null
  };
}

/* =====================================================
   REACTIONS (EMOJI)
===================================================== */

export async function reactToPost(postId, userId, emoji) {
  const post =
    await repo.getPostAuthor(postId);

  await repo.upsertReaction(postId, userId, emoji);

  if (post.author_id !== userId) {
    await notify({
      userId: post.author_id,
      title: "New reaction",
      body: `Someone reacted ${emoji} to your post`
    });
  }
}


export async function unreactPost(postId, userId) {
  return repo.removeReaction(postId, userId);
}

export async function editPost(postId, user, content) {
  const ok = await repo.updatePostContent(
    postId,
    user.id,
    content,
    user.role === "ADMIN"
  );

  if (!ok) {
    throw { status: 403, message: "Not allowed to edit post" };
  }
}

export async function pinPost(postId, user, pinned) {
  const ok = await repo.setPostPinned(
    postId,
    user.id,
    user.role === "ADMIN",
    pinned
  );

  if (!ok) {
    throw { status: 403, message: "Not allowed to pin post" };
  }
}

export async function updatePostVisibility(
  postId,
  user,
  visibility
) {
  const ok = await repo.updatePostVisibility(
    postId,
    user.id,
    user.role === "ADMIN",
    visibility
  );

  if (!ok) {
    throw { status: 403, message: "Not allowed" };
  }
}
