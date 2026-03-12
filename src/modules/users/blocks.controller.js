import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";

import {
  block,
  unblock,
  getBlockedUsers
} from "./blocks.service.js";

import { blockUserSchema } from "./users.extra.schema.js";

/* ---------------------------------------------
   BLOCK USER
--------------------------------------------- */
export const blockUserHandler = asyncHandler(async (req, res) => {
  const { target_user_id } = blockUserSchema.parse(req.body);

  await block(req.user, target_user_id, {
    ip: req.ip,
    browser: req.headers["user-agent"]
  });

  success(res, null, "User blocked");
});

/* ---------------------------------------------
   UNBLOCK USER
--------------------------------------------- */
export const unblockUserHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await unblock(req.user, id, {
    ip: req.ip,
    browser: req.headers["user-agent"]
  });

  success(res, null, "User unblocked");
});

/* ---------------------------------------------
   LIST BLOCKED USERS
--------------------------------------------- */
export const listBlockedUsersHandler = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const offset = Number(req.query.offset) || 0;

  const data = await getBlockedUsers(
    req.user.id,
    limit,
    offset
  );

  success(res, data);
});
