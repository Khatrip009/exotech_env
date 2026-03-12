import {
  blockUser,
  unblockUser,
  listBlockedUsers
} from "./blocks.repository.js";

import { auditAsync } from "../../middlewares/audit.helper.js";

export async function block(user, targetUserId, meta) {
  if (user.id === targetUserId) {
    throw {
      status: 400,
      message: "You cannot block yourself"
    };
  }

  await blockUser(user.id, targetUserId);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "BLOCK_USER",
    entityType: "USER",
    entityId: targetUserId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}

export async function unblock(user, targetUserId, meta) {
  await unblockUser(user.id, targetUserId);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "UNBLOCK_USER",
    entityType: "USER",
    entityId: targetUserId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}

export async function getBlockedUsers(userId, limit, offset) {
  return listBlockedUsers(userId, limit, offset);
}
