import { pool } from "../../db/pool.js";

/* =====================================================
   CREATE REPORT
===================================================== */
export async function createReport({
  reporterId,
  entityType,
  entityId,
  reason,
  description
}) {
  const { rows } = await pool.query(
    `
    INSERT INTO user_reports (
      reporter_id,
      reported_entity_type,
      reported_entity_id,
      reason,
      description
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      reporterId,
      entityType,
      entityId,
      reason,
      description || null
    ]
  );

  return rows[0];
}

/* =====================================================
   LIST REPORTS (ADMIN)
===================================================== */
export async function listReports({
  status,
  limit = 20,
  offset = 0
}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status) {
    conditions.push(`status = $${idx++}`);
    values.push(status);
  }

  const where =
    conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await pool.query(
    `
    SELECT
      r.*,
      u.email AS reporter_email
    FROM user_reports r
    LEFT JOIN users u ON u.id = r.reporter_id
    ${where}
    ORDER BY r.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
    `,
    [...values, limit, offset]
  );

  return rows;
}

/* =====================================================
   GET REPORT (ADMIN)
===================================================== */
export async function getReportById(reportId) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM user_reports
    WHERE id = $1
    `,
    [reportId]
  );

  return rows[0];
}

/* =====================================================
   RESOLVE REPORT
===================================================== */
export async function resolveReport({
  reportId,
  status
}) {
  const { rowCount } = await pool.query(
    `
    UPDATE user_reports
    SET
      status = $2,
      resolved_at = now()
    WHERE id = $1
      AND status = 'OPEN'
    `,
    [reportId, status]
  );

  return rowCount > 0;
}
