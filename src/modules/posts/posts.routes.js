// src/modules/posts/posts.routes.js
import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { auditAction } from "../../middlewares/audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { uploadPostMedia } from "../../middlewares/postUpload.middleware.js";
import { pinPostSchema } from "./posts.schema.js";

import * as c from "./posts.controller.js";
import {
  createPostSchema,
  reactionSchema
} from "./posts.schema.js";

const router = express.Router();

/* =========================
   CREATE POST (WITH MEDIA)
========================= */
router.post(
  "/",
  authRequired,
  validate(createPostSchema),
  uploadPostMedia.array("media", 5),
  auditAction("CREATE_POST", "POST"),
  asyncHandler(c.createPost)
);

/* =========================
   HOME FEED (FOLLOWERS)
========================= */
router.get(
  "/feed",
  authRequired,
  asyncHandler(c.getHomeFeed)
);

/* =========================
   USER POSTS
========================= */
router.get(
  "/user/:id",
  authRequired,
  asyncHandler(c.getUserPosts)
);

/* =========================
   GLOBAL FEED
========================= */
router.get(
  "/",
  authRequired,
  asyncHandler(c.getFeed)
);

/* =========================
   DELETE POST
========================= */
router.delete(
  "/:id",
  authRequired,
  asyncHandler(c.deletePost)
);

/* =========================
   LIKES
========================= */
router.post(
  "/:id/like",
  authRequired,
  asyncHandler(c.likePost)
);

router.delete(
  "/:id/like",
  authRequired,
  asyncHandler(c.unlikePost)
);

/* =========================
   COMMENTS
========================= */
router.post(
  "/:id/comments",
  authRequired,
  asyncHandler(c.addComment)
);

router.delete(
  "/comments/:id",
  authRequired,
  asyncHandler(c.deleteComment)
);

/* =========================
   FEEDS
========================= */
router.get(
  "/feed/ranked",
  authRequired,
  asyncHandler(c.getRankedFeed)
);

router.get(
  "/feed/ranked/cursor",
  authRequired,
  asyncHandler(c.getRankedFeedCursor)
);

/* =========================
   REACTIONS
========================= */
router.post(
  "/:id/reactions",
  authRequired,
  validate(reactionSchema),
  asyncHandler(c.react)
);

router.get(
  "/:id",
  authRequired,
  asyncHandler(c.getPost)
);

router.delete(
  "/:id/reactions",
  authRequired,
  asyncHandler(c.unreact)
);

router.patch(
  "/:id",
  authRequired,
  auditAction("EDIT_POST", "POST"),
  asyncHandler(c.editPost)
);

router.post(
  "/:id/pin",
  authRequired,
  validate(pinPostSchema),
  auditAction("PIN_POST", "POST"),
  asyncHandler(c.pinPost)
);


export default router;
