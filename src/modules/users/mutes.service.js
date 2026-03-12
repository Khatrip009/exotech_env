import {
  muteUser,
  unmuteUser,
  listMutedUsers
} from "./mutes.repository.js";

import { auditAsync } from "../../middlewares/audit.helper.js";

export async function mute(user, targetUserId, meta) {
  if (user.id === targetUserId) {
    throw {
      status: 400,
      message: "You cannot mute yourself"
    };
  }

  await muteUser(user.id, targetUserId);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "MUTE_USER",
    entityType: "USER",
    entityId: targetUserId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}

export async function unmute(user, targetUserId, meta) {
  await unmuteUser(user.id, targetUserId);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "UNMUTE_USER",
    entityType: "USER",
    entityId: targetUserId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}

export async function getMutedUsers(userId, limit, offset) {
  return listMutedUsers(userId, limit, offset);
}
