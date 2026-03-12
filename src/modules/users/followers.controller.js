import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";

import {
  follow,
  unfollow,
  getFollowers,
  getFollowing
} from "./followers.service.js";

import { followUserSchema } from "./users.extra.schema.js";

/* ---------------------------------------------
   FOLLOW USER
--------------------------------------------- */
export const followUserHandler = asyncHandler(async (req, res) => {
  const { target_user_id } = followUserSchema.parse(req.body);

  await follow(req.user, target_user_id, {
    ip: req.ip,
    browser: req.headers["user-agent"]
  });

  success(res, null, "User followed");
});

/* ---------------------------------------------
   UNFOLLOW USER
--------------------------------------------- */
export const unfollowUserHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await unfollow(req.user, id, {
    ip: req.ip,
    browser: req.headers["user-agent"]
  });

  success(res, null, "User unfollowed");
});

/* ---------------------------------------------
   LIST FOLLOWERS
--------------------------------------------- */
export const listFollowersHandler = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const offset = Number(req.query.offset) || 0;

  const data = await getFollowers(req.params.id, limit, offset);

  success(res, data);
});

/* ---------------------------------------------
   LIST FOLLOWING
--------------------------------------------- */
export const listFollowingHandler = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const offset = Number(req.query.offset) || 0;

  const data = await getFollowing(req.params.id, limit, offset);

  success(res, data);
});
