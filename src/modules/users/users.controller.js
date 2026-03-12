// src/modules/users/users.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";
import { fetchMe, updateMe } from "./users.service.js";
import { updateProfileSchema } from "./users.schema.js";
import { upsertUserProfile } from "./users.repository.js";

/* ---------------------------------------------
   GET AUTHENTICATED USER
--------------------------------------------- */
export const getMeHandler = asyncHandler(async (req, res) => {
  const user = await fetchMe(req.user.id);
  success(res, user, "Authenticated user fetched");
});

/* ---------------------------------------------
   UPDATE PROFILE + PRIVACY
--------------------------------------------- */
export const updateMeHandler = asyncHandler(async (req, res) => {
  const payload = updateProfileSchema.parse(req.body);

  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  await updateMe(req.user, payload, meta);

  success(res, null, "Profile updated successfully");
});

/* ---------------------------------------------
   UPLOAD PROFILE PHOTO
--------------------------------------------- */
export const uploadProfilePhotoHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image uploaded"
    });
  }

  const photoUrl = `/uploads/users/profiles/${req.user.id}/${req.file.filename}`;

  /**
   * IMPORTANT:
   * Ensure user_profiles row exists
   * full_name is NOT NULL
   */
  await upsertUserProfile(req.user.id, {
    profile_photo: photoUrl,
    full_name: req.user.full_name || "User"
  });

  success(
    res,
    { profile_photo: photoUrl },
    "Profile photo updated"
  );
});
