import express from "express";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { auditAction } from "../../middlewares/audit.middleware.js";

import {
  muteUserHandler,
  unmuteUserHandler,
  listMutedUsersHandler
} from "./mutes.controller.js";

const router = express.Router();

/* ---------------------------------------------
   MUTE
--------------------------------------------- */
router.post(
  "/mutes",
  authRequired,
  auditAction("MUTE_USER", "USER"),
  muteUserHandler
);

/* ---------------------------------------------
   UNMUTE
--------------------------------------------- */
router.delete(
  "/mutes/:id",
  authRequired,
  auditAction("UNMUTE_USER", "USER"),
  unmuteUserHandler
);

/* ---------------------------------------------
   LIST
--------------------------------------------- */
router.get(
  "/mutes",
  authRequired,
  listMutedUsersHandler
);

export default router;
