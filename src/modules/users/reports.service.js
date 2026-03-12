import {
  createReport,
  listReports,
  getReportById,
  resolveReport
} from "./reports.repository.js";

import { auditAsync } from "../../middlewares/audit.helper.js";

/* =====================================================
   FILE REPORT
===================================================== */
export async function fileReport(user, payload, meta) {
  const report = await createReport({
    reporterId: user.id,
    entityType: payload.reported_entity_type,
    entityId: payload.reported_entity_id,
    reason: payload.reason,
    description: payload.description
  });

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "CREATE_REPORT",
    entityType: payload.reported_entity_type,
    entityId: payload.reported_entity_id,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });

  return report;
}

/* =====================================================
   LIST REPORTS (ADMIN)
===================================================== */
export async function getReports(filters) {
  return listReports(filters);
}

/* =====================================================
   RESOLVE REPORT (ADMIN)
===================================================== */
export async function closeReport(
  admin,
  reportId,
  payload,
  meta
) {
  const report = await getReportById(reportId);

  if (!report) {
    throw {
      status: 404,
      message: "Report not found"
    };
  }

  if (report.status !== "OPEN") {
    throw {
      status: 400,
      message: "Report already resolved"
    };
  }

  await resolveReport({
    reportId,
    status: payload.status
  });

  auditAsync({
    actorId: admin.id,
    actorRole: admin.role,
    action: "RESOLVE_REPORT",
    entityType: report.reported_entity_type,
    entityId: report.reported_entity_id,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}
