import express from "express";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { auditAction } from "../../middlewares/audit.middleware.js";

import {
  listMySessionsHandler,
  revokeSessionHandler,
  revokeOtherSessionsHandler
} from "./sessions.controller.js";

const router = express.Router();

/* ---------------------------------------------
   LIST
--------------------------------------------- */
router.get(
  "/sessions",
  authRequired,
  auditAction("VIEW_SESSIONS", "USER"),
  listMySessionsHandler
);

/* ---------------------------------------------
   REVOKE ONE
--------------------------------------------- */
router.post(
  "/sessions/revoke",
  authRequired,
  auditAction("REVOKE_SESSION", "USER_SESSION"),
  revokeSessionHandler
);

/* ---------------------------------------------
   REVOKE ALL OTHERS
--------------------------------------------- */
router.post(
  "/sessions/revoke-others",
  authRequired,
  auditAction("REVOKE_OTHER_SESSIONS", "USER"),
  revokeOtherSessionsHandler
);

export default router;
