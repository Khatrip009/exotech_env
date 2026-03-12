// src/modules/users/users.schema.js
import { z } from "zod";

export const updateProfileSchema = z.object({
  profile: z.object({
    full_name: z.string().min(2).optional(),

    profile_photo: z
      .string()
      .url("Invalid image URL")
      .optional()
      .nullable(),

    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),

    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),

    address_text: z.string().max(500).optional(),

    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),

    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),

    google_place_id: z.string().max(255).optional(),

    bio: z.string().max(500).optional()
  }).optional(),

  privacy: z.object({
    profile_visibility: z.enum(["PUBLIC", "RESTRICTED", "PRIVATE"]).optional(),
    messaging_allowed: z.enum(["PUBLIC", "RESTRICTED", "PRIVATE"]).optional(),
    follower_approval_required: z.boolean().optional()
  }).optional()
});

/* =====================================================
   USER SESSIONS
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

/* =====================================================
   USER FOLLOWS
===================================================== */

export const followUserSchema = z.object({
  target_user_id: z.string().uuid()
});

export const updateFollowStatusSchema = z.object({
  is_active: z.boolean()
});

/* =====================================================
   USER BLOCKS
===================================================== */

export const blockUserSchema = z.object({
  target_user_id: z.string().uuid()
});

/* =====================================================
   USER MUTES
===================================================== */

export const muteUserSchema = z.object({
  target_user_id: z.string().uuid()
});

/* =====================================================
   USER DESIGNATIONS
===================================================== */

export const assignDesignationSchema = z.object({
  designation_id: z.string().uuid(),
  is_primary: z.boolean().optional()
});

export const removeDesignationSchema = z.object({
  designation_id: z.string().uuid()
});

/* =====================================================
   PRIVACY SETTINGS (REQUIRED — USED BY EXISTING CODE)
===================================================== */

export const privacySettingsSchema = z.object({
  profile_visibility: z
    .enum(["PUBLIC", "RESTRICTED", "PRIVATE"])
    .optional(),

  messaging_allowed: z
    .enum(["PUBLIC", "RESTRICTED", "PRIVATE"])
    .optional(),

  follower_approval_required: z.boolean().optional()
});