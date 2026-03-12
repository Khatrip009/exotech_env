// src/modules/users/users.public.service.js
import { getPublicUserProfile } from "./users.repository.js";
import {
  isFollowing,
  isBlockedBetween,
  isMuted
} from "./users.relationships.repository.js";

/**
 * Fetch public user profile with relationship flags
 * Enforces:
 * - Block rules
 * - Profile visibility rules
 * - Viewer-relative flags
 */
export async function getPublicProfile(viewer, targetUserId) {
  const profile = await getPublicUserProfile(targetUserId);

  if (!profile) {
    throw {
      status: 404,
      message: "User not found"
    };
  }

  /* =====================================================
     BLOCK ENFORCEMENT (STRONGEST RULE)
  ===================================================== */
  const blocked = viewer
    ? await isBlockedBetween(viewer.id, targetUserId)
    : false;

  if (blocked) {
    throw {
      status: 403,
      message: "Profile not accessible"
    };
  }

  /* =====================================================
     RELATIONSHIP FLAGS
  ===================================================== */
  const following = viewer
    ? await isFollowing(viewer.id, targetUserId)
    : false;

  const muted = viewer
    ? await isMuted(viewer.id, targetUserId)
    : false;

  /* =====================================================
     PROFILE VISIBILITY ENFORCEMENT
  ===================================================== */
  if (profile.profile_visibility === "PRIVATE") {
    if (!viewer || viewer.id !== targetUserId) {
      throw {
        status: 403,
        message: "This profile is private"
      };
    }
  }

  if (profile.profile_visibility === "RESTRICTED") {
    if (!viewer || !following) {
      throw {
        status: 403,
        message: "This profile is restricted to followers"
      };
    }
  }

  /* =====================================================
     FINAL RESPONSE
  ===================================================== */
  return {
    ...profile,
    is_following: following,
    is_blocked: blocked,
    is_muted: muted
  };
}
