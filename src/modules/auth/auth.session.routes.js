import express from "express";
import {
  refreshHandler,
  logoutHandler,
  adminRevokeHandler
} from "./auth.session.controller.js";

import { authRequired } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.post("/refresh", refreshHandler);

router.post("/logout", authRequired, logoutHandler);

router.post(
  "/admin/revoke/:userId",
  authRequired,
  authorize(["ADMIN"]),
  adminRevokeHandler
);

export default router;
