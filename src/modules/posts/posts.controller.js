// src/modules/posts/posts.controller.js
import * as service from "./posts.service.js";

export async function createPost(req, res) {
  const post = await service.createPost(
    req.user,
    req.body,
    req.files
  );
  res.json({ success: true, data: post });
}

export async function getPost(req, res) {
  const post = await service.getPostById(
    req.params.id,
    req.user.id
  );

  res.json({ success: true, data: post });
}

export async function getHomeFeed(req, res) {
  const { limit = 20, offset = 0 } = req.query;
  const posts = await service.getHomeFeed(
    req.user.id,
    limit,
    offset
  );
  res.json({ success: true, data: posts });
}


export async function getFeed(req, res) {
  const { limit = 20, offset = 0 } = req.query;

  const posts = await service.getFeed(
    limit,
    offset,
    req.user.id
  );

  res.json({ success: true, data: posts });
}


export async function getUserPosts(req, res) {
  const posts = await service.getUserFeed(
    req.user.id,
    req.params.id
  );
  res.json({ success: true, data: posts });
}

export async function editPost(req, res) {
  await service.editPost(
    req.params.id,
    req.user,
    req.body.content
  );

  res.json({ success: true });
}

export async function deletePost(req, res) {
  await service.removePost(req.params.id, req.user);
  res.json({ success: true });
}

export async function likePost(req, res) {
  await service.toggleLike(req.params.id, req.user.id, true);
  res.json({ success: true });
}

export async function unlikePost(req, res) {
  await service.toggleLike(req.params.id, req.user.id, false);
  res.json({ success: true });
}

export async function addComment(req, res) {
  const c = await service.createComment(
    req.params.id,
    req.user.id,
    req.body.comment
  );
  res.json({ success: true, data: c });
}

export async function deleteComment(req, res) {
  await service.removeComment(req.params.id, req.user.id);
  res.json({ success: true });
}

export async function getRankedFeed(req, res) {
  const { limit = 20, offset = 0 } = req.query;
  const posts = await service.getRankedFeed(
    req.user.id,
    limit,
    offset
  );
  res.json({ success: true, data: posts });
}

export async function getRankedFeedCursor(req, res) {
  const { limit = 20, cursor } = req.query;

  const result = await service.getRankedFeedCursor(
    req.user.id,
    Number(limit),
    cursor
  );

  res.json({
    success: true,
    data: result.posts,
    next_cursor: result.nextCursor,
  });
}

export async function react(req, res) {
  await service.reactToPost(
    req.params.id,
    req.user.id,
    req.body.emoji
  );
  res.json({ success: true });
}

export async function unreact(req, res) {
  await service.unreactPost(
    req.params.id,
    req.user.id
  );
  res.json({ success: true });
}

export async function reportPost(req, res) {
  await reportsService.report({
    reporterId: req.user.id,
    entityType: "POST",
    entityId: req.params.id,
    reason: req.body.reason
  });

  res.json({ success: true });
}

export async function pinPost(req, res) {
  await service.pinPost(
    req.params.id,
    req.user,
    req.body?.pinned ?? true
  );

  res.json({ success: true });
}
