import {
  followUser,
  unfollowUser,
  listFollowers,
  listFollowing
} from "./followers.repository.js";

import { auditAsync } from "../../middlewares/audit.helper.js";

export async function follow(user, targetUserId, meta) {
  if (user.id === targetUserId) {
    throw {
      status: 400,
      message: "You cannot follow yourself"
    };
  }

  await followUser(user.id, targetUserId);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "FOLLOW_USER",
    entityType: "USER",
    entityId: targetUserId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}

export async function unfollow(user, targetUserId, meta) {
  await unfollowUser(user.id, targetUserId);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "UNFOLLOW_USER",
    entityType: "USER",
    entityId: targetUserId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}

export async function getFollowers(userId, limit, offset) {
  return listFollowers(userId, limit, offset);
}

export async function getFollowing(userId, limit, offset) {
  return listFollowing(userId, limit, offset);
}
