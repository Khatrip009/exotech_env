import express from "express";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

import { auditAction } from "../../middlewares/audit.middleware.js";

import {
  createReportHandler,
  listReportsHandler,
  resolveReportHandler
} from "./reports.controller.js";

const router = express.Router();

/* ---------------------------------------------
   USER: FILE REPORT
--------------------------------------------- */
router.post(
  "/reports",
  authRequired,
  auditAction("CREATE_REPORT", "REPORT"),
  createReportHandler
);

/* ---------------------------------------------
   ADMIN: LIST REPORTS
--------------------------------------------- */
router.get(
  "/reports",
  authRequired,
  authorize("ADMIN"),
  auditAction("VIEW_REPORTS", "REPORT"),
  listReportsHandler
);

/* ---------------------------------------------
   ADMIN: RESOLVE
--------------------------------------------- */
router.post(
  "/reports/:id/resolve",
  authRequired,
  authorize("ADMIN"),
  auditAction("RESOLVE_REPORT", "REPORT"),
  resolveReportHandler
);

export default router;
