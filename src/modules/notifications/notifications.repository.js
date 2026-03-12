// src/modules/notifications/notifications.repository.js
import { pool } from "../../db/pool.js";

/* =========================
   NOTIFICATIONS
========================= */

export async function listNotifications(userId, limit = 20) {
  const { rows } = await pool.query(
    `SELECT id, title, body, is_read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

export async function createNotification({ userId, title, body }) {
  await pool.query(
    `INSERT INTO notifications (user_id, title, body)
     VALUES ($1, $2, $3)`,
    [userId, title, body]
  );
}

export async function markAsRead(notificationId, userId) {
  await pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE id = $1 AND user_id = $2`,
    [notificationId, userId]
  );
}

export async function markAllRead(userId) {
  await pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE user_id = $1`,
    [userId]
  );
}

/* =========================
   PREFERENCES
========================= */

export async function getPreferences(userId) {
  const { rows } = await pool.query(
    `SELECT email_enabled, push_enabled
     FROM notification_preferences
     WHERE user_id = $1`,
    [userId]
  );
  return rows[0] || null;
}

export async function upsertPreferences(userId, prefs) {
  await pool.query(
    `INSERT INTO notification_preferences (user_id, email_enabled, push_enabled)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id)
     DO UPDATE SET
       email_enabled = EXCLUDED.email_enabled,
       push_enabled = EXCLUDED.push_enabled`,
    [userId, prefs.email_enabled, prefs.push_enabled]
  );
}
