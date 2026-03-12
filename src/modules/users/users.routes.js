// src/modules/users/users.routes.js
import express from "express";

/* =====================================================
   CORE PROFILE
===================================================== */
import {
  getMeHandler,
  updateMeHandler,
  uploadProfilePhotoHandler
} from "./users.controller.js";

import { authRequired } from "../../middlewares/auth.middleware.js";
import { auditAction } from "../../middlewares/audit.middleware.js";
import { uploadProfilePhoto } from "../../middlewares/upload.middleware.js";

/* =====================================================
   USER DOMAIN SUB-MODULES
===================================================== */
import followersRoutes from "./followers.routes.js";
import blocksRoutes from "./blocks.routes.js";
import mutesRoutes from "./mutes.routes.js";
import sessionsRoutes from "./sessions.routes.js";
import reportsRoutes from "./reports.routes.js";
import { getPublicProfileHandler } from "./users.public.controller.js";
import { followSuggestionsHandler } from "./users.suggestions.controller.js";
import { searchUsersHandler } from "./users.search.controller.js";

const router = express.Router();

/* =====================================================
   SELF PROFILE
===================================================== */
router.get(
  "/me",
  authRequired,
  auditAction("VIEW_SELF_PROFILE", "USER"),
  getMeHandler
);

router.patch(
  "/me",
  authRequired,
  updateMeHandler
);

router.post(
  "/me/profile-photo",
  authRequired,
  (req, res, next) => {
    uploadProfilePhoto.single("photo")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed"
        });
      }
      next();
    });
  },
  uploadProfilePhotoHandler
);

/* =====================================================
   SOCIAL GRAPH
===================================================== */
router.use("/", followersRoutes);
router.use("/", blocksRoutes);
router.use("/", mutesRoutes);

/* =====================================================
   SECURITY
===================================================== */
router.use("/", sessionsRoutes);

/* =====================================================
   MODERATION
===================================================== */
router.use("/", reportsRoutes);

router.get(
  "/:id",
  authRequired,
  getPublicProfileHandler
);

router.get(
  "/suggestions/follow",
  authRequired,
  followSuggestionsHandler
);

router.get(
  "/search",
  authRequired,
  searchUsersHandler
);
export default router;
