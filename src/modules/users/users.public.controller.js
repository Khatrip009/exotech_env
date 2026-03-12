// src/modules/users/users.public.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";
import { getPublicProfile } from "./users.public.service.js";

export const getPublicProfileHandler = asyncHandler(async (req, res) => {
  const viewer = req.user || null;
  const targetUserId = req.params.id;

  const data = await getPublicProfile(viewer, targetUserId);

  success(res, data);
});
