// src/modules/users/users.service.js
import { getUserMe } from "./users.repository.js";
import {
  upsertUserProfile,
  upsertPrivacySettings
} from "./users.repository.js";
import { auditAsync } from "../../middlewares/audit.helper.js";

export async function fetchMe(userId) {
  const user = await getUserMe(userId);

  if (!user) {
    throw {
      status: 404,
      message: "User not found"
    };
  }

  return user;
}

export async function updateMe(user, payload, meta) {
  const { profile, privacy } = payload;

  if (profile) {
    await upsertUserProfile(user.id, profile);

    auditAsync({
      actorId: user.id,
      actorRole: user.role,
      action: "UPDATE_PROFILE",
      entityType: "USER_PROFILE",
      entityId: user.id,
      ipAddress: meta.ip,
      userAgent: meta.browser
    });
  }

  if (privacy) {
    await upsertPrivacySettings(user.id, privacy);

    auditAsync({
      actorId: user.id,
      actorRole: user.role,
      action: "UPDATE_PRIVACY",
      entityType: "PRIVACY_SETTINGS",
      entityId: user.id,
      ipAddress: meta.ip,
      userAgent: meta.browser
    });
  }
}