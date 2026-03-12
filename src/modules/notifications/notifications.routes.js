// src/modules/notifications/notifications.routes.js
import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { auditAction } from "../../middlewares/audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import * as c from "./notifications.controller.js";
import { preferencesSchema } from "./notifications.schema.js";

const router = express.Router();

/* =========================
   NOTIFICATIONS
========================= */
router.get(
  "/stream",
  authRequired,
  asyncHandler(c.streamNotifications)
);

router.get(
  "/",
  authRequired,
  asyncHandler(c.getNotifications)
);

router.post(
  "/:id/read",
  authRequired,
  auditAction("READ_NOTIFICATION", "NOTIFICATION"),
  asyncHandler(c.markRead)
);

router.post(
  "/read-all",
  authRequired,
  auditAction("READ_ALL_NOTIFICATIONS", "NOTIFICATION"),
  asyncHandler(c.markAllRead)
);

/* =========================
   PREFERENCES
========================= */

router.get(
  "/preferences",
  authRequired,
  asyncHandler(c.getPreferences)
);

router.put(
  "/preferences",
  authRequired,
  validate(preferencesSchema),
  auditAction("UPDATE_NOTIFICATION_PREFS", "USER"),
  asyncHandler(c.updatePreferences)
);

export default router;
