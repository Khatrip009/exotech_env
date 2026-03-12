import express from "express";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { auditAction } from "../../middlewares/audit.middleware.js";

import {
  followUserHandler,
  unfollowUserHandler,
  listFollowersHandler,
  listFollowingHandler
} from "./followers.controller.js";

const router = express.Router();

/* ---------------------------------------------
   FOLLOW
--------------------------------------------- */
router.post(
  "/follow",
  authRequired,
  auditAction("FOLLOW_USER", "USER"),
  followUserHandler
);

/* ---------------------------------------------
   UNFOLLOW
--------------------------------------------- */
router.delete(
  "/follow/:id",
  authRequired,
  auditAction("UNFOLLOW_USER", "USER"),
  unfollowUserHandler
);

/* ---------------------------------------------
   LIST
--------------------------------------------- */
router.get(
  "/:id/followers",
  authRequired,
  listFollowersHandler
);

router.get(
  "/:id/following",
  authRequired,
  listFollowingHandler
);

export default router;
