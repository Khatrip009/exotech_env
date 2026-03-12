import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";

import {
  mute,
  unmute,
  getMutedUsers
} from "./mutes.service.js";

import { muteUserSchema } from "./users.extra.schema.js";

/* ---------------------------------------------
   MUTE USER
--------------------------------------------- */
export const muteUserHandler = asyncHandler(async (req, res) => {
  const { target_user_id } = muteUserSchema.parse(req.body);

  await mute(req.user, target_user_id, {
    ip: req.ip,
    browser: req.headers["user-agent"]
  });

  success(res, null, "User muted");
});

/* ---------------------------------------------
   UNMUTE USER
--------------------------------------------- */
export const unmuteUserHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await unmute(req.user, id, {
    ip: req.ip,
    browser: req.headers["user-agent"]
  });

  success(res, null, "User unmuted");
});

/* ---------------------------------------------
   LIST MUTED USERS
--------------------------------------------- */
export const listMutedUsersHandler = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const offset = Number(req.query.offset) || 0;

  const data = await getMutedUsers(
    req.user.id,
    limit,
    offset
  );

  success(res, data);
});
