// src/modules/notifications/notifications.service.js
import {
  createNotification,
  listNotifications,
  markAsRead,
  markAllRead,
  getPreferences,
  upsertPreferences
} from "./notifications.repository.js";
import { pushToUser } from "./notification.stream.js";

/* =========================
   PUBLIC API
========================= */

export async function notify({ userId, title, body }) {
  await createNotification({ userId, title, body });

  // 🔔 real-time push
  pushToUser(userId, {
    title,
    body,
    created_at: new Date().toISOString()
  });
}

export async function getMyNotifications(userId) {
  return listNotifications(userId);
}

export async function readNotification(notificationId, userId) {
  await markAsRead(notificationId, userId);
}

export async function readAllNotifications(userId) {
  await markAllRead(userId);
}

export async function getMyPreferences(userId) {
  return getPreferences(userId);
}

export async function savePreferences(userId, prefs) {
  await upsertPreferences(userId, prefs);
}
