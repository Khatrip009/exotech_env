import express from "express";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { auditAction } from "../../middlewares/audit.middleware.js";

import {
  blockUserHandler,
  unblockUserHandler,
  listBlockedUsersHandler
} from "./blocks.controller.js";

const router = express.Router();

/* ---------------------------------------------
   BLOCK
--------------------------------------------- */
router.post(
  "/blocks",
  authRequired,
  auditAction("BLOCK_USER", "USER"),
  blockUserHandler
);

/* ---------------------------------------------
   UNBLOCK
--------------------------------------------- */
router.delete(
  "/blocks/:id",
  authRequired,
  auditAction("UNBLOCK_USER", "USER"),
  unblockUserHandler
);

/* ---------------------------------------------
   LIST
--------------------------------------------- */
router.get(
  "/blocks",
  authRequired,
  listBlockedUsersHandler
);

export default router;
