// src/modules/users/users.extra.schema.js
import { z } from "zod";

/* =====================================================
   FOLLOW / UNFOLLOW
===================================================== */
export const followUserSchema = z.object({
  target_user_id: z.string().uuid()
});

/* =====================================================
   BLOCK / UNBLOCK
===================================================== */
export const blockUserSchema = z.object({
  target_user_id: z.string().uuid()
});

/* =====================================================
   MUTE / UNMUTE
===================================================== */
export const muteUserSchema = z.object({
  target_user_id: z.string().uuid()
});

/* =====================================================
   SESSION MANAGEMENT
===================================================== */
export const revokeSessionSchema = z.object({
  session_id: z.string().uuid()
});

/* =====================================================
   USER REPORTS
===================================================== */
export const createUserReportSchema = z.object({
  reported_entity_type: z.enum([
    "USER",
    "POST",
    "COMMENT",
    "MESSAGE"
  ]),
  reported_entity_id: z.string().uuid(),
  reason: z.enum([
    "SPAM",
    "HARASSMENT",
    "HATE_SPEECH",
    "NUDITY",
    "VIOLENCE",
    "FRAUD",
    "OTHER"
  ]),
  description: z.string().max(1000).optional()
});

export const resolveUserReportSchema = z.object({
  status: z.enum(["RESOLVED", "REJECTED"]),
  resolution_note: z.string().max(1000).optional()
});
