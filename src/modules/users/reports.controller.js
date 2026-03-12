import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";

import {
  fileReport,
  getReports,
  closeReport
} from "./reports.service.js";

import {
  createUserReportSchema,
  resolveUserReportSchema
} from "./users.extra.schema.js";

/* ---------------------------------------------
   FILE REPORT (USER)
--------------------------------------------- */
export const createReportHandler = asyncHandler(async (req, res) => {
  const payload = createUserReportSchema.parse(req.body);

  const report = await fileReport(
    req.user,
    payload,
    {
      ip: req.ip,
      browser: req.headers["user-agent"]
    }
  );

  success(res, report, "Report submitted");
});

/* ---------------------------------------------
   LIST REPORTS (ADMIN)
--------------------------------------------- */
export const listReportsHandler = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const offset = Number(req.query.offset) || 0;
  const status = req.query.status || null;

  const data = await getReports({
    status,
    limit,
    offset
  });

  success(res, data);
});

/* ---------------------------------------------
   RESOLVE REPORT (ADMIN)
--------------------------------------------- */
export const resolveReportHandler = asyncHandler(async (req, res) => {
  const payload = resolveUserReportSchema.parse(req.body);

  await closeReport(
    req.user,
    req.params.id,
    payload,
    {
      ip: req.ip,
      browser: req.headers["user-agent"]
    }
  );

  success(res, null, "Report resolved");
});
